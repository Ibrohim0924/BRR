import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawMaterial, WarehouseMovement, MovementType } from '../entities';
import { CreateRawMaterialDto, UpdateRawMaterialDto } from './dto/raw-material.dto';
import { CreateMovementDto } from './dto/movement.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(RawMaterial)
    private rawMaterialRepository: Repository<RawMaterial>,
    @InjectRepository(WarehouseMovement)
    private movementRepository: Repository<WarehouseMovement>,
  ) {}

  async createRawMaterial(createRawMaterialDto: CreateRawMaterialDto): Promise<RawMaterial> {
    const rawMaterial = this.rawMaterialRepository.create(createRawMaterialDto);
    return this.rawMaterialRepository.save(rawMaterial);
  }

  async getAllRawMaterials(paginationDto: PaginationDto): Promise<PaginatedResponse<RawMaterial>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.rawMaterialRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRawMaterialById(id: string): Promise<RawMaterial> {
    const material = await this.rawMaterialRepository.findOne({
      where: { id },
      relations: ['movements'],
    });

    if (!material) {
      throw new NotFoundException(`Raw material with ID ${id} not found`);
    }

    return material;
  }

  async updateRawMaterial(id: string, updateRawMaterialDto: UpdateRawMaterialDto): Promise<RawMaterial> {
    const material = await this.getRawMaterialById(id);
    Object.assign(material, updateRawMaterialDto);
    return this.rawMaterialRepository.save(material);
  }

  async deleteRawMaterial(id: string): Promise<void> {
    const material = await this.getRawMaterialById(id);
    await this.rawMaterialRepository.remove(material);
  }

  async addMovement(createMovementDto: CreateMovementDto): Promise<WarehouseMovement> {
    const { rawMaterialId, type, quantity, unitCost, notes, createdById } = createMovementDto;

    const rawMaterial = await this.getRawMaterialById(rawMaterialId);

    if (type === MovementType.OUT && rawMaterial.currentStock < quantity) {
      throw new BadRequestException('Insufficient stock for outbound movement');
    }

    // Create movement record
    const movement = this.movementRepository.create({
      rawMaterialId,
      type,
      quantity,
      unitCost,
      notes,
      createdById,
    });

    const savedMovement = await this.movementRepository.save(movement);

    // Update stock
    if (type === MovementType.IN) {
      rawMaterial.currentStock = Number(rawMaterial.currentStock) + Number(quantity);
      if (unitCost) {
        rawMaterial.costPerUnit = unitCost;
      }
    } else {
      rawMaterial.currentStock = Number(rawMaterial.currentStock) - Number(quantity);
    }

    await this.rawMaterialRepository.save(rawMaterial);

    return savedMovement;
  }

  async getMovements(paginationDto: PaginationDto): Promise<PaginatedResponse<WarehouseMovement>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.movementRepository.findAndCount({
      relations: ['rawMaterial', 'createdBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMovementsByMaterial(materialId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<WarehouseMovement>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.movementRepository.findAndCount({
      where: { rawMaterialId: materialId },
      relations: ['rawMaterial', 'createdBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLowStockItems(): Promise<RawMaterial[]> {
    return this.rawMaterialRepository
      .createQueryBuilder('material')
      .where('material.currentStock <= material.minStockLevel')
      .getMany();
  }
}
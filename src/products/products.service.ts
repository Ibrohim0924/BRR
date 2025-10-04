import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductType } from '../entities';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async getAllProducts(paginationDto: PaginationDto, type?: ProductType): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10 } = paginationDto;
    
    const whereCondition = type ? { type } : {};
    
    const [data, total] = await this.productRepository.findAndCount({
      where: whereCondition,
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

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['saleItems', 'productionItems'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.getProductById(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);
    await this.productRepository.remove(product);
  }

  async getActiveProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract'): Promise<Product> {
    const product = await this.getProductById(id);
    
    if (operation === 'add') {
      product.currentStock = Number(product.currentStock) + Number(quantity);
    } else {
      product.currentStock = Number(product.currentStock) - Number(quantity);
    }

    return this.productRepository.save(product);
  }

  async getProductsByType(type: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { type: type as any, isActive: true },
      order: { name: 'ASC' },
    });
  }
}
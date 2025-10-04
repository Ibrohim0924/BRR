import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { CreateRawMaterialDto, UpdateRawMaterialDto } from './dto/raw-material.dto';
import { CreateMovementDto } from './dto/movement.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Warehouse')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('materials')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Create raw material' })
  @ApiResponse({ status: 201, description: 'Raw material created successfully' })
  async createRawMaterial(@Body() createRawMaterialDto: CreateRawMaterialDto) {
    return this.warehouseService.createRawMaterial(createRawMaterialDto);
  }

  @Get('materials')
  @ApiOperation({ summary: 'Get all raw materials' })
  @ApiResponse({ status: 200, description: 'Raw materials retrieved successfully' })
  async getAllRawMaterials(@Query() paginationDto: PaginationDto) {
    return this.warehouseService.getAllRawMaterials(paginationDto);
  }

  @Get('materials/low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({ status: 200, description: 'Low stock items retrieved successfully' })
  async getLowStockItems() {
    return this.warehouseService.getLowStockItems();
  }

  @Get('materials/:id')
  @ApiOperation({ summary: 'Get raw material by ID' })
  @ApiResponse({ status: 200, description: 'Raw material retrieved successfully' })
  async getRawMaterialById(@Param('id') id: string) {
    return this.warehouseService.getRawMaterialById(id);
  }

  @Put('materials/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Update raw material' })
  @ApiResponse({ status: 200, description: 'Raw material updated successfully' })
  async updateRawMaterial(
    @Param('id') id: string,
    @Body() updateRawMaterialDto: UpdateRawMaterialDto,
  ) {
    return this.warehouseService.updateRawMaterial(id, updateRawMaterialDto);
  }

  @Delete('materials/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete raw material' })
  @ApiResponse({ status: 200, description: 'Raw material deleted successfully' })
  async deleteRawMaterial(@Param('id') id: string) {
    return this.warehouseService.deleteRawMaterial(id);
  }

  @Post('movements')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Add warehouse movement' })
  @ApiResponse({ status: 201, description: 'Movement added successfully' })
  async addMovement(@Body() createMovementDto: CreateMovementDto, @Request() req) {
    createMovementDto.createdById = req.user.userId;
    return this.warehouseService.addMovement(createMovementDto);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get all movements' })
  @ApiResponse({ status: 200, description: 'Movements retrieved successfully' })
  async getMovements(@Query() paginationDto: PaginationDto) {
    return this.warehouseService.getMovements(paginationDto);
  }

  @Get('movements/material/:materialId')
  @ApiOperation({ summary: 'Get movements by material' })
  @ApiResponse({ status: 200, description: 'Material movements retrieved successfully' })
  async getMovementsByMaterial(
    @Param('materialId') materialId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.warehouseService.getMovementsByMaterial(materialId, paginationDto);
  }
}
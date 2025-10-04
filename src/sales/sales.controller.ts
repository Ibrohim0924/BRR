import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto, ReturnItemDto } from './dto/sale.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  async createSale(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.salesService.createSale(createSaleDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales' })
  @ApiResponse({ status: 200, description: 'Sales retrieved successfully' })
  async getAllSales(@Query() paginationDto: PaginationDto) {
    return this.salesService.getAllSales(paginationDto);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s sales summary' })
  @ApiResponse({ status: 200, description: 'Today\'s sales retrieved successfully' })
  async getTodaysSales() {
    return this.salesService.getTodaysSales();
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get sales by customer' })
  @ApiResponse({ status: 200, description: 'Customer sales retrieved successfully' })
  async getSalesByCustomer(
    @Param('customerId') customerId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.salesService.getSalesByCustomer(customerId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale retrieved successfully' })
  async getSaleById(@Param('id') id: string) {
    return this.salesService.getSaleById(id);
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Return items from sale' })
  @ApiResponse({ status: 200, description: 'Items returned successfully' })
  async returnItems(
    @Param('id') saleId: string,
    @Body() returnItemDto: ReturnItemDto,
  ) {
    return this.salesService.returnItems(saleId, returnItemDto);
  }
}
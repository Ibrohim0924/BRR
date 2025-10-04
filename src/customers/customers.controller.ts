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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CreatePaymentDto } from './dto/customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.createCustomer(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async getAllCustomers(
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
  ) {
    return this.customersService.getAllCustomers(paginationDto, search);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers' })
  @ApiResponse({ status: 200, description: 'Customers search results' })
  async searchCustomers(@Query('q') query: string) {
    return this.customersService.searchCustomers(query);
  }

  @Get('with-debt')
  @ApiOperation({ summary: 'Get customers with debt' })
  @ApiResponse({ status: 200, description: 'Customers with debt retrieved successfully' })
  async getCustomersWithDebt() {
    return this.customersService.getCustomersWithDebt();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  async getCustomerById(@Param('id') id: string) {
    return this.customersService.getCustomerById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  async deleteCustomer(@Param('id') id: string) {
    return this.customersService.deleteCustomer(id);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Add customer payment' })
  @ApiResponse({ status: 201, description: 'Payment added successfully' })
  async addPayment(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.customersService.addPayment(createPaymentDto, req.user.userId);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get customer payments' })
  @ApiResponse({ status: 200, description: 'Customer payments retrieved successfully' })
  async getCustomerPayments(
    @Param('id') customerId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.customersService.getCustomerPayments(customerId, paginationDto);
  }
}
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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Create new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  async createExpense(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return this.expensesService.createExpense(createExpenseDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({ status: 200, description: 'Expenses retrieved successfully' })
  async getAllExpenses(@Query() paginationDto: PaginationDto) {
    return this.expensesService.getAllExpenses(paginationDto);
  }

  @Get('monthly/:year/:month')
  @ApiOperation({ summary: 'Get monthly expenses summary' })
  @ApiResponse({ status: 200, description: 'Monthly expenses retrieved successfully' })
  async getMonthlyExpenses(
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.expensesService.getMonthlyExpenses(+year, +month);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get expenses by category' })
  @ApiResponse({ status: 200, description: 'Category expenses retrieved successfully' })
  async getExpensesByCategory(
    @Param('category') category: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.expensesService.getExpensesByCategory(category, paginationDto);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get expenses by date range' })
  @ApiResponse({ status: 200, description: 'Date range expenses retrieved successfully' })
  async getExpensesByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.expensesService.getExpensesByDateRange(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({ status: 200, description: 'Expense retrieved successfully' })
  async getExpenseById(@Param('id') id: string) {
    return this.expensesService.getExpenseById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Update expense' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  async updateExpense(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.updateExpense(id, updateExpenseDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  async deleteExpense(@Param('id') id: string) {
    return this.expensesService.deleteExpense(id);
  }
}
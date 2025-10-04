import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from '../entities';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async createExpense(createExpenseDto: CreateExpenseDto, userId: string): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      date: new Date(createExpenseDto.date),
      createdById: userId,
    });

    return this.expenseRepository.save(expense);
  }

  async getAllExpenses(paginationDto: PaginationDto): Promise<PaginatedResponse<Expense>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.expenseRepository.findAndCount({
      relations: ['createdBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExpenseById(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.getExpenseById(id);
    
    if (updateExpenseDto.date) {
      updateExpenseDto.date = new Date(updateExpenseDto.date) as any;
    }

    Object.assign(expense, updateExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async deleteExpense(id: string): Promise<void> {
    const expense = await this.getExpenseById(id);
    await this.expenseRepository.remove(expense);
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: {
        date: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['createdBy'],
      order: { date: 'DESC' },
    });
  }

  async getMonthlyExpenses(year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.date BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .select([
        'expense.category',
        'SUM(expense.amount) as total',
        'COUNT(expense.id) as count',
      ])
      .groupBy('expense.category')
      .getRawMany();

    const totalAmount = await this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.date BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .select('SUM(expense.amount)', 'total')
      .getRawOne();

    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      totalAmount: parseFloat(totalAmount.total || '0'),
      categories: expenses.map(exp => ({
        category: exp.expense_category,
        total: parseFloat(exp.total),
        count: parseInt(exp.count),
      })),
    };
  }

  async getExpensesByCategory(category: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Expense>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.expenseRepository.findAndCount({
      where: { category: category as any },
      relations: ['createdBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
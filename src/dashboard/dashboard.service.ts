import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Product, Sale, Customer, Expense, RawMaterial, ProductType } from '../entities';

export interface DashboardStats {
  todayProduction: {
    non: number;
    suv: number;
  };
  todaySales: {
    totalAmount: number;
    totalQuantity: number;
  };
  currentStock: {
    non: number;
    suv: number;
  };
  topDebtors: Array<{
    customerId: string;
    customerName: string;
    debt: number;
  }>;
  salesChart: Array<{
    date: string;
    sales: number;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(RawMaterial)
    private rawMaterialRepository: Repository<RawMaterial>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Today's sales
    const todaySales = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.items', 'items')
      .leftJoin('items.product', 'product')
      .where('sale.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .select([
        'SUM(sale.totalAmount) as totalAmount',
        'SUM(items.quantity) as totalQuantity',
      ])
      .getRawOne();

    // Current stock
    const nonStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.type = :type', { type: ProductType.NON })
      .select('SUM(product.currentStock)', 'total')
      .getRawOne();

    const suvStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.type = :type', { type: ProductType.SUV })
      .select('SUM(product.currentStock)', 'total')
      .getRawOne();

    // Top 5 debtors
    const topDebtors = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.currentDebt > 0')
      .orderBy('customer.currentDebt', 'DESC')
      .limit(5)
      .select([
        'customer.id as customerId',
        'customer.name as customerName',
        'customer.currentDebt as debt',
      ])
      .getRawMany();

    // Sales chart for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const salesChart = await Promise.all(
      last7Days.map(async (date) => {
        const startOfDate = new Date(date.setHours(0, 0, 0, 0));
        const endOfDate = new Date(date.setHours(23, 59, 59, 999));

        const sales = await this.saleRepository
          .createQueryBuilder('sale')
          .where('sale.createdAt BETWEEN :start AND :end', {
            start: startOfDate,
            end: endOfDate,
          })
          .select('SUM(sale.totalAmount)', 'total')
          .getRawOne();

        return {
          date: date.toISOString().split('T')[0],
          sales: parseFloat(sales.total || '0'),
        };
      })
    );

    // Note: Production data would come from production records
    // For now, we'll use stock changes as proxy
    return {
      todayProduction: {
        non: 0, // This would be calculated from production records
        suv: 0,
      },
      todaySales: {
        totalAmount: parseFloat(todaySales.totalAmount || '0'),
        totalQuantity: parseFloat(todaySales.totalQuantity || '0'),
      },
      currentStock: {
        non: parseFloat(nonStock.total || '0'),
        suv: parseFloat(suvStock.total || '0'),
      },
      topDebtors: topDebtors.map(debtor => ({
        customerId: debtor.customerId,
        customerName: debtor.customerName,
        debt: parseFloat(debtor.debt),
      })),
      salesChart,
    };
  }

  async getMonthlyReport(year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const [sales, expenses] = await Promise.all([
      this.saleRepository
        .createQueryBuilder('sale')
        .where('sale.createdAt BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfMonth,
        })
        .select([
          'SUM(sale.totalAmount) as totalSales',
          'COUNT(sale.id) as totalTransactions',
        ])
        .getRawOne(),
      
      this.expenseRepository
        .createQueryBuilder('expense')
        .where('expense.date BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfMonth,
        })
        .select('SUM(expense.amount)', 'totalExpenses')
        .getRawOne(),
    ]);

    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      totalSales: parseFloat(sales.totalSales || '0'),
      totalExpenses: parseFloat(expenses.totalExpenses || '0'),
      profit: parseFloat(sales.totalSales || '0') - parseFloat(expenses.totalExpenses || '0'),
      totalTransactions: parseInt(sales.totalTransactions || '0'),
    };
  }
}
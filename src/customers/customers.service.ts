import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Customer, Sale, Payment } from '../entities';
import { CreateCustomerDto, UpdateCustomerDto, CreatePaymentDto } from './dto/customer.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async getAllCustomers(paginationDto: PaginationDto, search?: string): Promise<PaginatedResponse<Customer>> {
    const { page = 1, limit = 10 } = paginationDto;
    
    const whereCondition = search
      ? [
          { name: ILike(`%${search}%`) },
          { companyName: ILike(`%${search}%`) },
          { phoneNumber: ILike(`%${search}%`) },
        ]
      : {};

    const [data, total] = await this.customerRepository.findAndCount({
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

  async getCustomerById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['sales', 'payments'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.getCustomerById(id);
    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async deleteCustomer(id: string): Promise<void> {
    const customer = await this.getCustomerById(id);
    
    // Check if customer has any sales or outstanding debt
    const salesCount = await this.saleRepository.count({ where: { customerId: id } });
    if (salesCount > 0) {
      throw new BadRequestException('Cannot delete customer with existing sales records');
    }

    if (customer.currentDebt > 0) {
      throw new BadRequestException('Cannot delete customer with outstanding debt');
    }

    await this.customerRepository.remove(customer);
  }

  async addPayment(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    const { customerId, saleId, amount, method, notes } = createPaymentDto;

    const customer = await this.getCustomerById(customerId);

    // If payment is for a specific sale, verify it exists and belongs to customer
    let sale: Sale | null = null;
    if (saleId) {
      sale = await this.saleRepository.findOne({
        where: { id: saleId, customerId },
      });

      if (!sale) {
        throw new NotFoundException(`Sale with ID ${saleId} not found for this customer`);
      }

      // Check if payment amount doesn't exceed remaining amount
      if (amount > sale.remainingAmount) {
        throw new BadRequestException('Payment amount exceeds remaining sale amount');
      }
    } else {
      // General payment against customer debt
      if (amount > customer.currentDebt) {
        throw new BadRequestException('Payment amount exceeds customer debt');
      }
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      customerId,
      saleId,
      amount,
      method,
      notes,
      receivedById: userId,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update customer debt
    await this.customerRepository.decrement(
      { id: customerId },
      'currentDebt',
      amount
    );

    // If payment is for a specific sale, update sale amounts
    if (sale) {
      sale.paidAmount += amount;
      sale.remainingAmount -= amount;
      await this.saleRepository.save(sale);
    }

    return savedPayment;
  }

  async getCustomerPayments(customerId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Payment>> {
    const { page = 1, limit = 10 } = paginationDto;
    
    const [data, total] = await this.paymentRepository.findAndCount({
      where: { customerId },
      relations: ['sale', 'receivedBy'],
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

  async getCustomersWithDebt(): Promise<Customer[]> {
    return this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.currentDebt > 0')
      .orderBy('customer.currentDebt', 'DESC')
      .getMany();
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.name ILIKE :query OR customer.companyName ILIKE :query OR customer.phoneNumber ILIKE :query', {
        query: `%${query}%`,
      })
      .limit(10)
      .getMany();
  }
}
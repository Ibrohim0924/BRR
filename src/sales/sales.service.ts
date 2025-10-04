import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale, SaleItem, Product, Customer, Payment } from '../entities';
import { CreateSaleDto, ReturnItemDto } from './dto/sale.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createSale(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
    const { customerId, items, paymentType, paidAmount = 0, notes } = createSaleDto;

    // Verify customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Verify products and calculate total
    let totalAmount = 0;
    const saleItems: Partial<SaleItem>[] = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      if (product.currentStock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`);
      }

      const itemTotal = item.quantity * item.unitPrice;
      totalAmount += itemTotal;

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal,
      });
    }

    const remainingAmount = totalAmount - paidAmount;

    // Create sale
    const sale = this.saleRepository.create({
      customerId,
      totalAmount,
      paidAmount,
      remainingAmount,
      paymentType,
      notes,
      createdById: userId,
      items: saleItems as SaleItem[],
    });

    const savedSale = await this.saleRepository.save(sale);

    // Update product stocks
    for (const item of items) {
      await this.productRepository.decrement(
        { id: item.productId },
        'currentStock',
        item.quantity
      );
    }

    // Update customer debt if not fully paid
    if (remainingAmount > 0) {
      await this.customerRepository.increment(
        { id: customerId },
        'currentDebt',
        remainingAmount
      );
    }

    return this.saleRepository.findOne({
      where: { id: savedSale.id },
      relations: ['customer', 'items', 'items.product', 'createdBy'],
    }) as Promise<Sale>;
  }

  async getAllSales(paginationDto: PaginationDto): Promise<PaginatedResponse<Sale>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.saleRepository.findAndCount({
      relations: ['customer', 'items', 'items.product', 'createdBy'],
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

  async getSaleById(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product', 'createdBy', 'payments'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async getSalesByCustomer(customerId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Sale>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.saleRepository.findAndCount({
      where: { customerId },
      relations: ['customer', 'items', 'items.product', 'createdBy'],
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

  async returnItems(saleId: string, returnItemDto: ReturnItemDto): Promise<Sale> {
    const { saleItemId, returnQuantity, reason } = returnItemDto;

    const sale = await this.getSaleById(saleId);
    const saleItem = sale.items.find(item => item.id === saleItemId);

    if (!saleItem) {
      throw new NotFoundException(`Sale item with ID ${saleItemId} not found in this sale`);
    }

    if (returnQuantity > (saleItem.quantity - saleItem.returnedQuantity)) {
      throw new BadRequestException('Return quantity exceeds available quantity');
    }

    // Update sale item
    saleItem.returnedQuantity += returnQuantity;
    await this.saleItemRepository.save(saleItem);

    // Update product stock
    await this.productRepository.increment(
      { id: saleItem.productId },
      'currentStock',
      returnQuantity
    );

    // Calculate refund amount
    const refundAmount = returnQuantity * saleItem.unitPrice;

    // Update sale totals
    sale.totalAmount -= refundAmount;
    sale.remainingAmount = Math.max(0, sale.totalAmount - sale.paidAmount);
    
    // Update customer debt
    await this.customerRepository.decrement(
      { id: sale.customerId },
      'currentDebt',
      refundAmount
    );

    return this.saleRepository.save(sale);
  }

  async getTodaysSales(): Promise<{ totalSales: number; totalAmount: number }> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .where('sale.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .select([
        'COUNT(sale.id) as totalSales',
        'SUM(sale.totalAmount) as totalAmount',
      ])
      .getRawOne();

    return {
      totalSales: parseInt(result.totalSales || '0'),
      totalAmount: parseFloat(result.totalAmount || '0'),
    };
  }
}
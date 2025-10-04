import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { SaleItem } from './sale-item.entity';
import { Payment } from './payment.entity';

export enum PaymentType {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT = 'credit',
}

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.sales)
  @JoinColumn()
  customer: Customer;

  @Column()
  customerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.CASH,
  })
  paymentType: PaymentType;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @Column()
  createdById: string;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @OneToMany(() => Payment, (payment) => payment.sale)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
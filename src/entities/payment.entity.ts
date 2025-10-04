import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Sale } from './sale.entity';
import { User } from './user.entity';

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.payments)
  @JoinColumn()
  customer: Customer;

  @Column()
  customerId: string;

  @ManyToOne(() => Sale, (sale) => sale.payments, { nullable: true })
  @JoinColumn()
  sale?: Sale;

  @Column({ nullable: true })
  saleId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  method: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn()
  receivedBy: User;

  @Column()
  receivedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
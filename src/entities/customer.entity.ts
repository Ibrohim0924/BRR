import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Sale } from './sale.entity';
import { Payment } from './payment.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentDebt: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Sale, (sale) => sale.customer)
  sales: Sale[];

  @OneToMany(() => Payment, (payment) => payment.customer)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
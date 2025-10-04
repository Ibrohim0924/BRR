import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProductionItem } from './production-item.entity';
import { SaleItem } from './sale-item.entity';

export enum ProductType {
  NON = 'non', // Bread
  SUV = 'suv', // Water
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  unit: string; // piece, liter, kg

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ProductionItem, (item) => item.product)
  productionItems: ProductionItem[];

  @OneToMany(() => SaleItem, (item) => item.product)
  saleItems: SaleItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
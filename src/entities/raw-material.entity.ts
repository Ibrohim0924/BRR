import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProductionItem } from './production-item.entity';
import { WarehouseMovement } from './warehouse-movement.entity';

export enum MaterialType {
  FLOUR = 'flour',
  YEAST = 'yeast',
  SALT = 'salt',
  WATER = 'water',
  FILTER = 'filter',
  BOTTLE = 'bottle',
  OTHER = 'other',
}

@Entity('raw_materials')
export class RawMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.OTHER,
  })
  type: MaterialType;

  @Column()
  unit: string; // kg, liter, piece, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minStockLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPerUnit: number;

  @OneToMany(() => WarehouseMovement, (movement) => movement.rawMaterial)
  movements: WarehouseMovement[];

  @OneToMany(() => ProductionItem, (item) => item.rawMaterial)
  productionItems: ProductionItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
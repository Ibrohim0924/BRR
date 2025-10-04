import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { RawMaterial } from './raw-material.entity';

@Entity('production_items')
export class ProductionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.productionItems)
  @JoinColumn()
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => RawMaterial, (material) => material.productionItems)
  @JoinColumn()
  rawMaterial: RawMaterial;

  @Column()
  rawMaterialId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityUsed: number;

  @CreateDateColumn()
  createdAt: Date;
}
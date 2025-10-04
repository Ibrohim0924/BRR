import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { RawMaterial } from './raw-material.entity';
import { User } from './user.entity';

export enum MovementType {
  IN = 'in',
  OUT = 'out',
}

@Entity('warehouse_movements')
export class WarehouseMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RawMaterial, (material) => material.movements)
  @JoinColumn()
  rawMaterial: RawMaterial;

  @Column()
  rawMaterialId: string;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;
}
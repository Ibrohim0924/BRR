import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { RawMaterial, WarehouseMovement } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([RawMaterial, WarehouseMovement]),
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
})
export class WarehouseModule {}
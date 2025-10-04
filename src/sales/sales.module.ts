import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale, SaleItem, Product, Customer, Payment } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem, Product, Customer, Payment]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Product, Sale, Customer, Expense, RawMaterial } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Sale, Customer, Expense, RawMaterial]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
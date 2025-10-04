import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer, Sale, Payment } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Sale, Payment]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User, Product, RawMaterial, Customer } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, RawMaterial, Customer])],
  providers: [SeedService],
})
export class SeedModule {}
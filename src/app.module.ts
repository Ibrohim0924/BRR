import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { SalesModule } from './sales/sales.module';
import { CustomersModule } from './customers/customers.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './common/seed.module';
import { User, Customer, RawMaterial, WarehouseMovement, Product, ProductionItem, Sale, SaleItem, Payment, Expense } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'non_suv_db',
      entities: [User, Customer, RawMaterial, WarehouseMovement, Product, ProductionItem, Sale, SaleItem, Payment, Expense],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    DashboardModule,
    WarehouseModule,
    SalesModule,
    CustomersModule,
    ExpensesModule,
    ProductsModule,
    SeedModule,
  ]
})
export class AppModule {}

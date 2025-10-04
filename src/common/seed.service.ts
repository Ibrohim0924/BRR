import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Product, RawMaterial, Customer } from '../entities';
import { UserRole, ProductType, MaterialType } from '../entities';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(RawMaterial)
    private rawMaterialRepository: Repository<RawMaterial>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
    await this.seedProducts();
    await this.seedRawMaterials();
    await this.seedCustomers();
  }

  private async seedUsers() {
    const userCount = await this.userRepository.count();
    if (userCount === 0) {
      const users = [
        {
          username: 'admin',
          password: await bcrypt.hash('admin123', 10),
          fullName: 'System Administrator',
          role: UserRole.ADMIN,
        },
        {
          username: 'accountant',
          password: await bcrypt.hash('accountant123', 10),
          fullName: 'Chief Accountant',
          role: UserRole.ACCOUNTANT,
        },
        {
          username: 'sales',
          password: await bcrypt.hash('sales123', 10),
          fullName: 'Sales Manager',
          role: UserRole.SALES,
        },
      ];

      await this.userRepository.save(users);
      console.log('✓ Users seeded successfully');
    }
  }

  private async seedProducts() {
    const productCount = await this.productRepository.count();
    if (productCount === 0) {
      const products = [
        {
          name: 'Fresh Bread',
          type: ProductType.NON,
          price: 2.5,
          unit: 'piece',
          currentStock: 100,
        },
        {
          name: 'Whole Wheat Bread',
          type: ProductType.NON,
          price: 3.0,
          unit: 'piece',
          currentStock: 50,
        },
        {
          name: 'Drinking Water 0.5L',
          type: ProductType.SUV,
          price: 0.5,
          unit: 'bottle',
          currentStock: 500,
        },
        {
          name: 'Drinking Water 1.5L',
          type: ProductType.SUV,
          price: 1.0,
          unit: 'bottle',
          currentStock: 200,
        },
      ];

      await this.productRepository.save(products);
      console.log('✓ Products seeded successfully');
    }
  }

  private async seedRawMaterials() {
    const materialCount = await this.rawMaterialRepository.count();
    if (materialCount === 0) {
      const materials = [
        {
          name: 'Flour',
          type: MaterialType.FLOUR,
          unit: 'kg',
          currentStock: 1000,
          minStockLevel: 100,
          costPerUnit: 1.2,
        },
        {
          name: 'Yeast',
          type: MaterialType.YEAST,
          unit: 'kg',
          currentStock: 50,
          minStockLevel: 10,
          costPerUnit: 5.0,
        },
        {
          name: 'Salt',
          type: MaterialType.SALT,
          unit: 'kg',
          currentStock: 100,
          minStockLevel: 20,
          costPerUnit: 0.8,
        },
        {
          name: 'Water Filters',
          type: MaterialType.FILTER,
          unit: 'piece',
          currentStock: 20,
          minStockLevel: 5,
          costPerUnit: 25.0,
        },
        {
          name: 'Water Bottles 0.5L',
          type: MaterialType.BOTTLE,
          unit: 'piece',
          currentStock: 1000,
          minStockLevel: 200,
          costPerUnit: 0.1,
        },
        {
          name: 'Water Bottles 1.5L',
          type: MaterialType.BOTTLE,
          unit: 'piece',
          currentStock: 500,
          minStockLevel: 100,
          costPerUnit: 0.2,
        },
      ];

      await this.rawMaterialRepository.save(materials);
      console.log('✓ Raw materials seeded successfully');
    }
  }

  private async seedCustomers() {
    const customerCount = await this.customerRepository.count();
    if (customerCount === 0) {
      const customers = [
        {
          name: 'Ahmed Karimov',
          companyName: 'Karimov Market',
          phoneNumber: '+998901234567',
          address: '123 Tashkent Street, Tashkent',
          currentDebt: 0,
        },
        {
          name: 'Dilshod Umarov',
          companyName: 'Umarov Trading',
          phoneNumber: '+998902345678',
          address: '456 Samarkand Avenue, Samarkand',
          currentDebt: 25.50,
        },
        {
          name: 'Oybek Rashidov',
          phoneNumber: '+998903456789',
          address: '789 Bukhara Road, Bukhara',
          currentDebt: 12.75,
        },
      ];

      await this.customerRepository.save(customers);
      console.log('✓ Customers seeded successfully');
    }
  }
}
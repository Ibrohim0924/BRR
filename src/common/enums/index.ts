export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  SALES = 'sales',
}

export enum ProductType {
  NON = 'non', // Bread
  SUV = 'suv', // Water
}

export enum MaterialType {
  FLOUR = 'flour',
  YEAST = 'yeast',
  SALT = 'salt',
  WATER = 'water',
  FILTER = 'filter',
  BOTTLE = 'bottle',
  OTHER = 'other',
}

export enum MovementType {
  IN = 'in',
  OUT = 'out',
}

export enum PaymentType {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT = 'credit',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

export enum ExpenseCategory {
  ELECTRICITY = 'electricity',
  GAS = 'gas',
  SALARY = 'salary',
  UTILITIES = 'utilities',
  RAW_MATERIALS = 'raw_materials',
  MAINTENANCE = 'maintenance',
  TRANSPORT = 'transport',
  OTHER = 'other',
}
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'accountant' | 'sales';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  description?: string;
  totalDebt: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'BREAD' | 'WATER' | 'OTHER';
  price: number;
  unit: string;
  stock: number;
  minStock: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  customerId: string;
  customer?: Customer;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  paymentMethod: 'CASH' | 'CREDIT' | 'BANK_TRANSFER' | 'CARD';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minStock: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseMovement {
  id: string;
  materialId: string;
  material?: RawMaterial;
  type: 'IN' | 'OUT';
  quantity: number;
  unitCost?: number;
  description?: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customer?: Customer;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD';
  description?: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}
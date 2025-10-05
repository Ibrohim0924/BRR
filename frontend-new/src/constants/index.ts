export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    MONTHLY_REPORT: '/dashboard/monthly-report',
  },
  PRODUCTS: {
    BASE: '/products',
    ACTIVE: '/products/active',
    BY_TYPE: '/products/type',
    UPDATE_STOCK: '/products/:id/stock',
  },
  CUSTOMERS: {
    BASE: '/customers',
    SEARCH: '/customers/search',
    WITH_DEBT: '/customers/with-debt',
    PAYMENTS: '/customers/payments',
    CUSTOMER_PAYMENTS: '/customers/:id/payments',
  },
  SALES: {
    BASE: '/sales',
    TODAY: '/sales/today',
    BY_CUSTOMER: '/sales/customer/:customerId',
    RETURN: '/sales/:id/return',
  },
  WAREHOUSE: {
    MATERIALS: '/warehouse/materials',
    LOW_STOCK: '/warehouse/materials/low-stock',
    MOVEMENTS: '/warehouse/movements',
    MOVEMENTS_BY_MATERIAL: '/warehouse/movements/material/:materialId',
  },
  EXPENSES: {
    BASE: '/expenses',
    MONTHLY: '/expenses/monthly/:year/:month',
    BY_CATEGORY: '/expenses/category/:category',
    DATE_RANGE: '/expenses/date-range',
  },
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  SALES: 'sales',
} as const;

export const PRODUCT_TYPES = {
  BREAD: 'BREAD',
  WATER: 'WATER',
  OTHER: 'OTHER',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CREDIT: 'CREDIT',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CARD: 'CARD',
} as const;

export const MOVEMENT_TYPES = {
  IN: 'IN',
  OUT: 'OUT',
} as const;

export const EXPENSE_CATEGORIES = {
  SALARY: 'SALARY',
  UTILITIES: 'UTILITIES',
  RAW_MATERIALS: 'RAW_MATERIALS',
  EQUIPMENT: 'EQUIPMENT',
  TRANSPORT: 'TRANSPORT',
  MARKETING: 'MARKETING',
  MAINTENANCE: 'MAINTENANCE',
  OTHER: 'OTHER',
} as const;
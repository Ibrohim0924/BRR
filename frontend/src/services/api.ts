import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      toast.error('Server xatosi yuz berdi');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: {
    username: string;
    password: string;
    fullName: string;
    role: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getMonthlyReport: async (year: number, month: number) => {
    const response = await api.get(`/dashboard/monthly-report?year=${year}&month=${month}`);
    return response.data;
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: { page?: number; limit?: number; type?: string }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getActive: async () => {
    const response = await api.get('/products/active');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  update: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  updateStock: async (id: string, quantity: number, operation: 'add' | 'subtract') => {
    const response = await api.patch(`/products/${id}/stock`, { quantity, operation });
    return response.data;
  },
};

// Customers API
export const customersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },
  search: async (query: string) => {
    const response = await api.get(`/customers/search?q=${query}`);
    return response.data;
  },
  getWithDebt: async () => {
    const response = await api.get('/customers/with-debt');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  create: async (customerData: any) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  update: async (id: string, customerData: any) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
  addPayment: async (paymentData: any) => {
    const response = await api.post('/customers/payments', paymentData);
    return response.data;
  },
  getPayments: async (customerId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/customers/${customerId}/payments`, { params });
    return response.data;
  },
};

// Sales API
export const salesApi = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },
  getToday: async () => {
    const response = await api.get('/sales/today');
    return response.data;
  },
  getByCustomer: async (customerId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/sales/customer/${customerId}`, { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
  create: async (saleData: any) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },
  returnItems: async (saleId: string, returnData: any) => {
    const response = await api.patch(`/sales/${saleId}/return`, returnData);
    return response.data;
  },
};

// Warehouse API
export const warehouseApi = {
  getMaterials: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/warehouse/materials', { params });
    return response.data;
  },
  getLowStock: async () => {
    const response = await api.get('/warehouse/materials/low-stock');
    return response.data;
  },
  getMaterialById: async (id: string) => {
    const response = await api.get(`/warehouse/materials/${id}`);
    return response.data;
  },
  createMaterial: async (materialData: any) => {
    const response = await api.post('/warehouse/materials', materialData);
    return response.data;
  },
  updateMaterial: async (id: string, materialData: any) => {
    const response = await api.put(`/warehouse/materials/${id}`, materialData);
    return response.data;
  },
  deleteMaterial: async (id: string) => {
    const response = await api.delete(`/warehouse/materials/${id}`);
    return response.data;
  },
  getMovements: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/warehouse/movements', { params });
    return response.data;
  },
  addMovement: async (movementData: any) => {
    const response = await api.post('/warehouse/movements', movementData);
    return response.data;
  },
  getMovementsByMaterial: async (materialId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/warehouse/movements/material/${materialId}`, { params });
    return response.data;
  },
};

// Expenses API
export const expensesApi = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },
  getMonthly: async (year: number, month: number) => {
    const response = await api.get(`/expenses/monthly/${year}/${month}`);
    return response.data;
  },
  getByCategory: async (category: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/expenses/category/${category}`, { params });
    return response.data;
  },
  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get(`/expenses/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  create: async (expenseData: any) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },
  update: async (id: string, expenseData: any) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};
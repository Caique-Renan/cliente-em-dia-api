import { api } from './api';
import { CustomerStatus } from '../types/customer';
import type { Customer, CustomerListResponse } from '../types/customer';

export const customersService = {
  list: async (params?: Record<string, any>): Promise<CustomerListResponse> => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  findById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: CustomerStatus): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/status`, { status });
    return response.data;
  }
};

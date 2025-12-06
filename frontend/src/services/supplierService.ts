import api from './api';
import { Supplier } from '../types';

export const supplierService = {
  async getAll(params?: any): Promise<Supplier[]> {
    const response = await api.get<Supplier[]>('/suppliers', { params });
    return response.data;
  },

  async getById(id: string): Promise<Supplier> {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.post<Supplier>('/suppliers', data);
    return response.data;
  },

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.put<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },
};


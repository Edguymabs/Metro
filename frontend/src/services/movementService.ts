import api from './api';
import { Movement } from '../types';

export const movementService = {
  async getAll(params?: any): Promise<Movement[]> {
    const response = await api.get<Movement[]>('/movements', { params });
    return response.data;
  },

  async create(data: Partial<Movement>): Promise<Movement> {
    const response = await api.post<Movement>('/movements', data);
    return response.data;
  },

  async update(id: string, data: Partial<Movement>): Promise<Movement> {
    const response = await api.put<Movement>(`/movements/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/movements/${id}`);
  },

  async getOverdue(): Promise<Movement[]> {
    const response = await api.get<Movement[]>('/movements/overdue');
    return response.data;
  },
};


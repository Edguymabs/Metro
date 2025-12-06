import api from './api';
import { Instrument, DashboardStats } from '../types';

export const instrumentService = {
  async getAll(params?: any): Promise<Instrument[]> {
    const response = await api.get<Instrument[]>('/instruments', { params });
    return response.data;
  },

  async getById(id: string): Promise<Instrument> {
    const response = await api.get<Instrument>(`/instruments/${id}`);
    return response.data;
  },

  async create(data: Partial<Instrument>): Promise<Instrument> {
    const response = await api.post<Instrument>('/instruments', data);
    return response.data;
  },

  async update(id: string, data: Partial<Instrument>): Promise<Instrument> {
    const response = await api.put<Instrument>(`/instruments/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/instruments/${id}`);
  },

  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/instruments/stats');
    return response.data;
  },
};


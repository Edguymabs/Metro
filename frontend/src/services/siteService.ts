import api from './api';
import { Site } from '../types';

export const siteService = {
  async getAll(params?: any): Promise<Site[]> {
    const response = await api.get<Site[]>('/sites', { params });
    return response.data;
  },

  async getById(id: string): Promise<Site> {
    const response = await api.get<Site>(`/sites/${id}`);
    return response.data;
  },

  async create(data: Partial<Site>): Promise<Site> {
    const response = await api.post<Site>('/sites', data);
    return response.data;
  },

  async update(id: string, data: Partial<Site>): Promise<Site> {
    const response = await api.put<Site>(`/sites/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/sites/${id}`);
  },
};


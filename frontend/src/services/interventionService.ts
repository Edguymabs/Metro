import api from './api';
import { Intervention, InterventionStats } from '../types';

export const interventionService = {
  async getAll(params?: any): Promise<Intervention[]> {
    const response = await api.get<Intervention[]>('/interventions', { params });
    return response.data;
  },

  async getById(id: string): Promise<Intervention> {
    const response = await api.get<Intervention>(`/interventions/${id}`);
    return response.data;
  },

  async create(data: Partial<Intervention>): Promise<Intervention> {
    const response = await api.post<Intervention>('/interventions', data);
    return response.data;
  },

  async update(id: string, data: Partial<Intervention>): Promise<Intervention> {
    const response = await api.put<Intervention>(`/interventions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/interventions/${id}`);
  },

  async getStats(): Promise<InterventionStats> {
    const response = await api.get<InterventionStats>('/interventions/stats');
    return response.data;
  },
};


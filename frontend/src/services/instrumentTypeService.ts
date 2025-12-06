import api from './api';
import { InstrumentType } from '../types';

export const instrumentTypeService = {
  async getAll(): Promise<InstrumentType[]> {
    const response = await api.get<InstrumentType[]>('/instrument-types');
    return response.data;
  },

  async create(data: Partial<InstrumentType>): Promise<InstrumentType> {
    const response = await api.post<InstrumentType>('/instrument-types', data);
    return response.data;
  },

  async update(id: string, data: Partial<InstrumentType>): Promise<InstrumentType> {
    const response = await api.put<InstrumentType>(`/instrument-types/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/instrument-types/${id}`);
  },
};


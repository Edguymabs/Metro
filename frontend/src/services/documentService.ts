import api from './api';
import { Document } from '../types';

export const documentService = {
  async getAll(params?: any): Promise<Document[]> {
    const response = await api.get<Document[]>('/documents', { params });
    return response.data;
  },

  async upload(file: File, instrumentId?: string, interventionId?: string, description?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (instrumentId) formData.append('instrumentId', instrumentId);
    if (interventionId) formData.append('interventionId', interventionId);
    if (description) formData.append('description', description);

    const response = await api.post<Document>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDownloadUrl(id: string): string {
    return `${api.defaults.baseURL}/documents/${id}/download`;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};


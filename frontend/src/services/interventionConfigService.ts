import axios from 'axios';
import { InterventionMenuConfig } from '../types/interventionConfig';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

class InterventionConfigService {
  private baseUrl = `${API_BASE_URL}/intervention-configs`;

  // Récupérer toutes les configurations
  async getAll(): Promise<InterventionMenuConfig[]> {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des configurations:', error);
      throw error;
    }
  }

  // Récupérer une configuration par ID
  async getById(id: string): Promise<InterventionMenuConfig> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      throw error;
    }
  }

  // Récupérer la configuration active
  async getActive(): Promise<InterventionMenuConfig> {
    try {
      const response = await axios.get(`${this.baseUrl}/active`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration active:', error);
      throw error;
    }
  }

  // Créer une nouvelle configuration
  async create(config: Partial<InterventionMenuConfig>): Promise<InterventionMenuConfig> {
    try {
      const response = await axios.post(this.baseUrl, config);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la configuration:', error);
      throw error;
    }
  }

  // Mettre à jour une configuration
  async update(id: string, config: Partial<InterventionMenuConfig>): Promise<InterventionMenuConfig> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, config);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
      throw error;
    }
  }

  // Supprimer une configuration
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la configuration:', error);
      throw error;
    }
  }

  // Activer une configuration
  async setActive(id: string): Promise<InterventionMenuConfig> {
    try {
      const response = await axios.post(`${this.baseUrl}/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'activation de la configuration:', error);
      throw error;
    }
  }

  // Dupliquer une configuration
  async duplicate(id: string, newName: string): Promise<InterventionMenuConfig> {
    try {
      const response = await axios.post(`${this.baseUrl}/${id}/duplicate`, { name: newName });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la duplication de la configuration:', error);
      throw error;
    }
  }

  // Créer une configuration à partir d'un template
  async createFromTemplate(templateId: string, name: string, description?: string): Promise<InterventionMenuConfig> {
    try {
      const response = await axios.post(`${this.baseUrl}/from-template`, {
        templateId,
        name,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création depuis le template:', error);
      throw error;
    }
  }

  // Exporter une configuration
  async export(id: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'export de la configuration:', error);
      throw error;
    }
  }

  // Importer une configuration
  async import(file: File): Promise<InterventionMenuConfig> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${this.baseUrl}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'import de la configuration:', error);
      throw error;
    }
  }

  // Valider une configuration
  async validate(config: Partial<InterventionMenuConfig>): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const response = await axios.post(`${this.baseUrl}/validate`, config);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation de la configuration:', error);
      throw error;
    }
  }

  // Récupérer les statistiques d'utilisation
  async getUsageStats(id: string): Promise<{
    totalInterventions: number;
    interventionsByType: Record<string, number>;
    interventionsByStatus: Record<string, number>;
    lastUsed: string;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      throw error;
    }
  }
}

export const interventionConfigService = new InterventionConfigService();

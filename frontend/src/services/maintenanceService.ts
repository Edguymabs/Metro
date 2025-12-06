import api from './api';
import { MaintenanceMessage, MaintenanceMessageForm, MaintenanceNotification } from '../types/maintenance';

class MaintenanceService {

  // Récupérer tous les messages de maintenance
  async getAllMessages(): Promise<MaintenanceMessage[]> {
    try {
      const response = await api.get('/maintenance');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des messages de maintenance:', error);
      throw error;
    }
  }

  // Récupérer les messages actifs pour l'utilisateur actuel
  async getActiveMessages(): Promise<MaintenanceMessage[]> {
    try {
      const response = await api.get('/maintenance/active');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des messages actifs:', error);
      throw error;
    }
  }

  // Récupérer un message par ID
  async getMessageById(id: string): Promise<MaintenanceMessage> {
    try {
      const response = await api.get(`/maintenance/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement du message:', error);
      throw error;
    }
  }

  // Créer un nouveau message de maintenance
  async createMessage(message: MaintenanceMessageForm): Promise<MaintenanceMessage> {
    try {
      const response = await api.post('/maintenance', message);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du message:', error);
      throw error;
    }
  }

  // Mettre à jour un message de maintenance
  async updateMessage(id: string, message: Partial<MaintenanceMessageForm>): Promise<MaintenanceMessage> {
    try {
      const response = await api.put(`/maintenance/${id}`, message);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }

  // Supprimer un message de maintenance
  async deleteMessage(id: string): Promise<void> {
    try {
      await api.delete(`/maintenance/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  // Activer/désactiver un message
  async toggleMessageStatus(id: string, isActive: boolean): Promise<MaintenanceMessage> {
    try {
      const response = await api.patch(`/maintenance/${id}/toggle`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      throw error;
    }
  }

  // Récupérer les notifications de maintenance
  async getNotifications(): Promise<MaintenanceNotification[]> {
    try {
      const response = await api.get('/maintenance/notifications');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/maintenance/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await api.patch('/maintenance/notifications/read-all');
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      throw error;
    }
  }

  // Dupliquer un message
  async duplicateMessage(id: string, newTitle: string): Promise<MaintenanceMessage> {
    try {
      const response = await api.post(`/maintenance/${id}/duplicate`, { title: newTitle });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la duplication du message:', error);
      throw error;
    }
  }

  // Programmer un message (définir une date de début future)
  async scheduleMessage(id: string, startDate: string): Promise<MaintenanceMessage> {
    try {
      const response = await api.patch(`/maintenance/${id}/schedule`, { startDate });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la programmation du message:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des messages
  async getMessageStats(): Promise<{
    total: number;
    active: number;
    scheduled: number;
    expired: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const response = await api.get('/maintenance/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      throw error;
    }
  }

  // Valider un message avant sauvegarde
  async validateMessage(message: MaintenanceMessageForm): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const response = await api.post('/maintenance/validate', message);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation du message:', error);
      throw error;
    }
  }

  // Récupérer l'historique des messages
  async getMessageHistory(id: string): Promise<{
    message: MaintenanceMessage;
    history: Array<{
      action: string;
      timestamp: string;
      user: string;
      changes: Record<string, any>;
    }>;
  }> {
    try {
      const response = await api.get(`/maintenance/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      throw error;
    }
  }
}

export const maintenanceService = new MaintenanceService();

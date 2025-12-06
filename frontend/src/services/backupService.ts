import api from './api';

export interface Backup {
  filename: string;
  size: number;
  created: Date;
  type: string;
}

export interface BackupListResponse {
  backups: Backup[];
  count: number;
}

export interface ExportResponse {
  message: string;
  filename: string;
  count?: number;
}

export interface ImportResponse {
  message: string;
  imported: number;
  errors?: string[];
}

const backupService = {
  // Créer un backup SQL complet
  async createBackup(): Promise<ExportResponse> {
    const response = await api.post('/backup/create');
    return response.data;
  },

  // Export sélectif d'une entité
  async exportEntity(entity: string, format: 'excel' | 'csv' | 'json'): Promise<ExportResponse> {
    const response = await api.post(`/backup/export/${entity}/${format}`);
    return response.data;
  },

  // Export complet de toutes les entités
  async exportAll(format: 'excel' | 'csv' | 'json'): Promise<ExportResponse> {
    const response = await api.post(`/backup/export-all/${format}`);
    return response.data;
  },

  // Lister tous les backups disponibles
  async listBackups(): Promise<BackupListResponse> {
    const response = await api.get('/backup/list');
    return response.data;
  },

  // Restaurer un backup SQL
  async restoreBackup(filename: string): Promise<{ message: string }> {
    const response = await api.post('/backup/restore', { filename });
    return response.data;
  },

  // Importer des données depuis un fichier
  async importData(entity: string, file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/backup/import/${entity}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Télécharger un fichier de backup
  async downloadBackup(filename: string): Promise<void> {
    const response = await api.get(`/backup/download/${filename}`, {
      responseType: 'blob',
    });

    // Créer un lien de téléchargement et le déclencher
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Supprimer un backup
  async deleteBackup(filename: string): Promise<{ message: string }> {
    const response = await api.delete(`/backup/${filename}`);
    return response.data;
  },

  // Formater la taille du fichier
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  // Formater la date
  formatDate(date: Date | string): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  },
};

export default backupService;


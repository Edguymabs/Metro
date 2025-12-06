// Types pour les messages de maintenance
export interface MaintenanceMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  startDate: string;
  endDate?: string;
  targetAudience: 'all' | 'admins' | 'users' | 'specific';
  targetRoles?: string[];
  targetUsers?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface MaintenanceMessageForm {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  startDate: string;
  endDate?: string;
  targetAudience: 'all' | 'admins' | 'users' | 'specific';
  targetRoles?: string[];
  targetUsers?: string[];
}

// Types pour les notifications en temps réel
export interface MaintenanceNotification {
  id: string;
  message: MaintenanceMessage;
  isRead: boolean;
  createdAt: string;
}

// Configuration des types de messages
export const MAINTENANCE_MESSAGE_TYPES = {
  info: {
    label: 'Information',
    color: '#3b82f6',
    icon: 'info',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  warning: {
    label: 'Avertissement',
    color: '#f59e0b',
    icon: 'alert-triangle',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800'
  },
  error: {
    label: 'Erreur',
    color: '#ef4444',
    icon: 'x-circle',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800'
  },
  success: {
    label: 'Succès',
    color: '#10b981',
    icon: 'check-circle',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800'
  }
};

export const MAINTENANCE_PRIORITIES = {
  low: {
    label: 'Faible',
    color: '#6b7280',
    icon: 'chevron-down'
  },
  medium: {
    label: 'Moyenne',
    color: '#f59e0b',
    icon: 'minus'
  },
  high: {
    label: 'Élevée',
    color: '#ef4444',
    icon: 'chevron-up'
  },
  critical: {
    label: 'Critique',
    color: '#dc2626',
    icon: 'alert-triangle'
  }
};

export const TARGET_AUDIENCES = {
  all: {
    label: 'Tous les utilisateurs',
    description: 'Message visible par tous les utilisateurs connectés'
  },
  admins: {
    label: 'Administrateurs uniquement',
    description: 'Message visible uniquement par les administrateurs'
  },
  users: {
    label: 'Utilisateurs non-admin',
    description: 'Message visible par tous sauf les administrateurs'
  },
  specific: {
    label: 'Utilisateurs spécifiques',
    description: 'Message visible par des utilisateurs ou rôles spécifiques'
  }
};

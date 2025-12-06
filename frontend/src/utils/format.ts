import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    return '-';
  }
};

export const formatDateTime = (date: string | Date | undefined): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch (error) {
    return '-';
  }
};

export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatCalibrationFrequency = (value: number, unit: string): string => {
  const unitLabels: Record<string, { singular: string; plural: string }> = {
    DAYS: { singular: 'jour', plural: 'jours' },
    WEEKS: { singular: 'semaine', plural: 'semaines' },
    MONTHS: { singular: 'mois', plural: 'mois' },
    YEARS: { singular: 'an', plural: 'ans' },
  };

  const label = unitLabels[unit];
  if (!label) return `${value} ${unit}`;

  return `${value} ${value === 1 ? label.singular : label.plural}`;
};

export const getStatusBadgeClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    CONFORME: 'badge-success',
    NON_CONFORME: 'badge-danger',
    EN_MAINTENANCE: 'badge-info',
    CASSE: 'badge-gray',
    PLANIFIEE: 'badge-info',
    EN_COURS: 'badge-warning',
    TERMINEE: 'badge-success',
    ANNULEE: 'badge-gray',
    AVEC_RESERVES: 'badge-warning',
  };
  return statusMap[status] || 'badge-gray';
};

export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    CONFORME: 'Conforme',
    NON_CONFORME: 'Non conforme',
    EN_MAINTENANCE: 'En maintenance',
    CASSE: 'Cassé',
    PLANIFIEE: 'Planifiée',
    EN_COURS: 'En cours',
    TERMINEE: 'Terminée',
    ANNULEE: 'Annulée',
    AVEC_RESERVES: 'Avec réserves',
    ETALONNAGE: 'Étalonnage',
    VERIFICATION: 'Vérification',
    MAINTENANCE: 'Maintenance',
    REPARATION: 'Réparation',
    ENLEVEMENT: 'Enlèvement',
    RETOUR: 'Retour',
    TRANSFERT: 'Transfert',
    ADMIN: 'Administrateur',
    RESPONSABLE_METROLOGIE: 'Responsable Métrologie',
    TECHNICIEN: 'Technicien',
    LECTURE_SEULE: 'Lecture seule',
  };
  return translations[status] || status;
};


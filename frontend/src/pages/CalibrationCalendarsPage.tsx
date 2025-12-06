import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Calendar, Users, Power, PowerOff } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { calibrationCalendarService, CalibrationCalendar } from '../services/calibrationCalendarService';
import ConfirmDialog from '../components/common/ConfirmDialog';

const CalibrationCalendarsPage: React.FC = () => {
  const { showToast } = useToast();
  const [calendars, setCalendars] = useState<CalibrationCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadCalendars();
  }, [showInactive]);

  const loadCalendars = async () => {
    try {
      const data = await calibrationCalendarService.getAll({
        active: showInactive ? undefined : true,
      });
      setCalendars(data);
    } catch (error) {
      showToast('Erreur lors du chargement des calendriers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await calibrationCalendarService.delete(deleteId);
      showToast('Calendrier supprimé avec succès', 'success');
      loadCalendars();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await calibrationCalendarService.toggleActive(id, !active);
      showToast(
        `Calendrier ${!active ? 'activé' : 'désactivé'} avec succès`,
        'success'
      );
      loadCalendars();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la modification', 'error');
    }
  };

  const formatRecurrence = (calendar: CalibrationCalendar): string => {
    switch (calendar.recurrenceType) {
      case 'FIXED_INTERVAL':
        return `Tous les ${calendar.frequencyValue} ${calendar.frequencyUnit?.toLowerCase()}`;
      case 'CALENDAR_DAILY':
        return 'Tous les jours';
      case 'CALENDAR_WEEKLY':
        return 'Hebdomadaire';
      case 'CALENDAR_MONTHLY':
        return 'Mensuel';
      case 'CALENDAR_YEARLY':
        return 'Annuel';
      default:
        return 'Non configuré';
    }
  };

  const formatTolerance = (calendar: CalibrationCalendar): string => {
    if (calendar.toleranceValue === 0) return 'Aucune';
    return `+${calendar.toleranceValue} ${calendar.toleranceUnit.toLowerCase()}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendriers d'Étalonnage</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les planifications d'étalonnage pour vos instruments
          </p>
        </div>
        <Link
          to="/calendriers-etalonnage/nouveau"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau calendrier
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Afficher les calendriers inactifs
        </label>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">À propos des calendriers d'étalonnage</p>
            <p className="mt-1">
              Les calendriers permettent d'appliquer une planification spécifique à plusieurs
              instruments. Vous pouvez créer différents calendriers pour des équipements similaires
              ayant des criticités différentes.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des calendriers */}
      {calendars.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun calendrier</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer votre premier calendrier d'étalonnage
          </p>
          <div className="mt-6">
            <Link to="/calendriers-etalonnage/nouveau" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouveau calendrier
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calendars.map((calendar) => (
            <div
              key={calendar.id}
              className={`bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow ${
                !calendar.active ? 'border-gray-300 opacity-60' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{calendar.name}</h3>
                    {!calendar.active && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                        Inactif
                      </span>
                    )}
                  </div>
                  {calendar.calibrationMethod && (
                    <p className="mt-2 text-xs text-gray-500">
                      Basé sur: {calendar.calibrationMethod.name}
                    </p>
                  )}
                  {calendar.calibrationMethod?.instrumentType && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
                      {calendar.calibrationMethod.instrumentType.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(calendar.id, calendar.active)}
                    className={`${
                      calendar.active
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={calendar.active ? 'Désactiver' : 'Activer'}
                  >
                    {calendar.active ? (
                      <Power className="w-4 h-4" />
                    ) : (
                      <PowerOff className="w-4 h-4" />
                    )}
                  </button>
                  <Link
                    to={`/calendriers-etalonnage/${calendar.id}/modifier`}
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(calendar.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {calendar.description && (
                <p className="text-sm text-gray-600 mb-4">{calendar.description}</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Fréquence:</span>
                  <span>{formatRecurrence(calendar)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Tolérance:</span>
                  <span>{formatTolerance(calendar)}</span>
                </div>

                {calendar._count && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Instruments:</span>
                    <span>{calendar._count.instruments}</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Link
                  to={`/calendriers-etalonnage/${calendar.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Voir les détails →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le calendrier"
        message="Êtes-vous sûr de vouloir supprimer ce calendrier d'étalonnage ? Les instruments associés ne seront plus liés à ce calendrier."
        confirmText="Supprimer"
        variant="danger"
      />
    </div>
  );
};

export default CalibrationCalendarsPage;


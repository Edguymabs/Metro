import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText, Clock, AlertTriangle, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { calibrationMethodService, CalibrationMethod } from '../services/calibrationMethodService';
import ConfirmDialog from '../components/common/ConfirmDialog';

const CalibrationMethodsPage: React.FC = () => {
  const { showToast } = useToast();
  const [methods, setMethods] = useState<CalibrationMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const data = await calibrationMethodService.getAll();
      setMethods(data);
    } catch (error) {
      showToast('Erreur lors du chargement des méthodes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await calibrationMethodService.delete(deleteId);
      showToast('Méthode supprimée avec succès', 'success');
      loadMethods();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const formatRecurrence = (method: CalibrationMethod): string => {
    switch (method.recurrenceType) {
      case 'FIXED_INTERVAL':
        return `Tous les ${method.frequencyValue} ${method.frequencyUnit?.toLowerCase()}`;
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

  const formatTolerance = (method: CalibrationMethod): string => {
    if (method.toleranceValue === 0) return 'Aucune';
    return `+${method.toleranceValue} ${method.toleranceUnit.toLowerCase()}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Méthodes d'Étalonnage</h1>
          <p className="mt-1 text-sm text-gray-500">
            Créez des templates réutilisables pour vos étalonnages
          </p>
        </div>
        <div className="flex gap-3">
        <Link
          to="/methodes-etalonnage/gestion-masse"
          className="btn-secondary flex items-center gap-2"
        >
          <Users className="w-5 h-5" />
          Gestion en masse
        </Link>
        <Link
          to="/methodes-etalonnage/nouvelle"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle méthode
        </Link>
        </div>
      </div>

      {/* Info */}
      <div className="alert-info p-4">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-800">
            <p className="font-medium">À propos des méthodes d'étalonnage</p>
            <p className="mt-1">
              Les méthodes d'étalonnage sont des templates que vous pouvez appliquer à plusieurs
              instruments du même type. Elles définissent la fréquence, la tolérance et la
              procédure d'étalonnage.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des méthodes */}
      {methods.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune méthode</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer votre première méthode d'étalonnage
          </p>
          <div className="mt-6">
            <Link to="/methodes-etalonnage/nouvelle" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle méthode
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <div
              key={method.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              onClick={() => window.location.href = `/methodes-etalonnage/${method.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                  {method.instrumentType && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                      {method.instrumentType.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/methodes-etalonnage/${method.id}/modifier`}
                    className="text-gray-400 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(method.id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {method.description && (
                <p className="text-sm text-gray-600 mb-4">{method.description}</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Fréquence:</span>
                  <span>{formatRecurrence(method)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Tolérance:</span>
                  <span>{formatTolerance(method)}</span>
                </div>

                {method.estimatedDuration && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Durée:</span>
                    <span>{method.estimatedDuration} min</span>
                  </div>
                )}

                {method.procedure && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Procédure:</span>
                    <span>{method.procedure}</span>
                  </div>
                )}
              </div>

              {method._count && method._count.calendars > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Utilisée dans {method._count.calendars} calendrier
                    {method._count.calendars > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Link
                  to={`/methodes-etalonnage/${method.id}`}
                  className="text-sm text-primary hover:text-primary-600 font-medium"
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
        title="Supprimer la méthode"
        message="Êtes-vous sûr de vouloir supprimer cette méthode d'étalonnage ? Cette action est irréversible."
        confirmText="Supprimer"
        variant="danger"
      />
    </div>
  );
};

export default CalibrationMethodsPage;


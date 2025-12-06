import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Clock, Wrench, FileText, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { calibrationMethodService, CalibrationMethod } from '../services/calibrationMethodService';
import Breadcrumbs from '../components/common/Breadcrumbs';

const CalibrationMethodDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<CalibrationMethod | null>(null);

  useEffect(() => {
    if (id) {
      loadMethod();
    }
  }, [id]);

  const loadMethod = async () => {
    try {
      const data = await calibrationMethodService.getById(id!);
      setMethod(data);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors du chargement de la méthode', 'error');
      navigate('/methodes-etalonnage');
    } finally {
      setLoading(false);
    }
  };

  const getRecurrenceDescription = (method: CalibrationMethod) => {
    switch (method.recurrenceType) {
      case 'FIXED_INTERVAL':
        const unit = method.frequencyUnit === 'DAYS' ? 'jour(s)' :
                    method.frequencyUnit === 'WEEKS' ? 'semaine(s)' :
                    method.frequencyUnit === 'MONTHS' ? 'mois' : 'année(s)';
        return `Tous les ${method.frequencyValue} ${unit}`;
      case 'WEEKLY':
        const days = method.daysOfWeek?.map(day => {
          const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          return dayNames[parseInt(day)];
        }).join(', ') || '';
        return `Hebdomadaire (${days})`;
      case 'MONTHLY':
        return `Mensuel (jour ${method.dayOfMonth})`;
      case 'YEARLY':
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return `Annuel (${months[method.monthOfYear! - 1]} ${method.dayOfMonth})`;
      default:
        return 'Non défini';
    }
  };

  const getToleranceDescription = (method: CalibrationMethod) => {
    const unit = method.toleranceUnit === 'DAYS' ? 'jour(s)' :
                method.toleranceUnit === 'WEEKS' ? 'semaine(s)' :
                method.toleranceUnit === 'MONTHS' ? 'mois' : 'année(s)';
    return `${method.toleranceValue} ${unit}`;
  };

  const getDurationDescription = (method: CalibrationMethod) => {
    if (!method.estimatedDuration) return 'Non spécifiée';
    return `${method.estimatedDuration} minutes`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!method) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Méthode non trouvée</h3>
        <p className="mt-1 text-sm text-gray-500">
          La méthode d'étalonnage demandée n'existe pas.
        </p>
        <div className="mt-6">
          <Link to="/methodes-etalonnage" className="btn-primary">
            Retour aux méthodes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/' },
          { label: 'Méthodes d\'étalonnage', href: '/methodes-etalonnage' },
          { label: method.name }
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/methodes-etalonnage')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{method.name}</h1>
            <p className="mt-1 text-gray-600">
              Détails de la méthode d'étalonnage
            </p>
          </div>
        </div>
        <Link
          to={`/methodes-etalonnage/${method.id}/modifier`}
          className="btn-primary flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {method.description || 'Aucune description fournie.'}
            </p>
          </div>

          {/* Type d'instrument */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Type d'instrument</h2>
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{method.instrumentType?.name || 'Non spécifié'}</span>
            </div>
          </div>

          {/* Planification */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Planification</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Fréquence:</span>
                  <span className="ml-2 text-gray-700">{getRecurrenceDescription(method)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Tolérance:</span>
                  <span className="ml-2 text-gray-700">+{getToleranceDescription(method)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Durée:</span>
                  <span className="ml-2 text-gray-700">{getDurationDescription(method)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Procédure */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Procédure</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {method.procedure || 'Aucune procédure définie.'}
              </p>
            </div>
          </div>

          {/* Équipement requis */}
          {method.requiredEquipment && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Équipement requis</h2>
              <p className="text-gray-700">{method.requiredEquipment}</p>
            </div>
          )}
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisation</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Calendriers:</span>
                  <span className="ml-2 text-gray-700">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations techniques */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations techniques</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{method.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Créée le</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(method.createdAt).toLocaleDateString('fr-FR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Modifiée le</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(method.updatedAt).toLocaleDateString('fr-FR')}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions rapides */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Actions rapides</h4>
            <div className="space-y-2">
              <Link
                to={`/methodes-etalonnage/${method.id}/modifier`}
                className="block w-full text-center px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Modifier la méthode
              </Link>
              <Link
                to="/calendriers-etalonnage"
                className="block w-full text-center px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Voir les calendriers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationMethodDetailPage;

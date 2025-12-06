import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interventionService } from '../services/interventionService';
import { Intervention } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { formatDate, formatCurrency } from '../utils/format';
import { Edit, Trash2, ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';

const InterventionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadIntervention(id);
    }
  }, [id]);

  const loadIntervention = async (interventionId: string) => {
    try {
      const data = await interventionService.getById(interventionId);
      setIntervention(data);
    } catch (error) {
      showToast('Erreur lors du chargement de l\'intervention', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await interventionService.delete(id);
      showToast('Intervention supprimée avec succès', 'success');
      navigate('/interventions');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!intervention) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Intervention non trouvée</p>
        <Link to="/interventions" className="mt-4 inline-block text-primary-600 hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Interventions', href: '/interventions' },
          { label: `Intervention #${intervention.id.substring(0, 8)}` },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/interventions" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <StatusBadge status={intervention.type} />
            </h1>
            <p className="mt-1 text-gray-600">
              {intervention.instrument?.name} - {intervention.instrument?.serialNumber}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to={`/interventions/${id}/modifier`} className="btn-secondary">
            <Edit className="inline-block w-4 h-4 mr-2" />
            Modifier
          </Link>
          <button onClick={() => setShowDeleteDialog(true)} className="btn-danger">
            <Trash2 className="inline-block w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Informations générales */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Type</label>
            <div className="mt-1">
              <StatusBadge status={intervention.type} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Statut</label>
            <div className="mt-1">
              <StatusBadge status={intervention.status} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Instrument</label>
            <p className="mt-1 text-gray-900">
              <Link
                to={`/instruments/${intervention.instrument?.id}`}
                className="text-primary-600 hover:underline"
              >
                {intervention.instrument?.name}
              </Link>
            </p>
            <p className="text-sm text-gray-500">{intervention.instrument?.serialNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Fournisseur</label>
            <p className="mt-1 text-gray-900">{intervention.supplier?.name || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Date prévue</label>
            <p className="mt-1 text-gray-900">{formatDate(intervention.scheduledDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Date de réalisation</label>
            <p className="mt-1 text-gray-900">{formatDate(intervention.completedDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Coût</label>
            <p className="mt-1 text-gray-900">{formatCurrency(intervention.cost)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Créée par</label>
            <p className="mt-1 text-gray-900">
              {intervention.createdBy?.firstName} {intervention.createdBy?.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Résultats */}
      {intervention.status === 'TERMINEE' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Résultats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Résultat de conformité</label>
              <div className="mt-1">
                {intervention.conformityResult ? (
                  <StatusBadge status={intervention.conformityResult} />
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Numéro de certificat</label>
              <p className="mt-1 text-gray-900">{intervention.certificateNumber || '-'}</p>
            </div>
            {intervention.type === 'ETALONNAGE' && (
              <div>
                <label className="text-sm font-medium text-gray-600">Prochaine date d'étalonnage</label>
                <p className="mt-1 text-gray-900">{formatDate(intervention.nextCalibrationDate)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Observations */}
      {intervention.observations && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Observations</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{intervention.observations}</p>
        </div>
      )}

      {/* Documents */}
      {intervention.documents && intervention.documents.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <FileText className="inline-block w-5 h-5 mr-2" />
            Documents associés
          </h2>
          <div className="space-y-2">
            {intervention.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{doc.originalName}</p>
                  <p className="text-sm text-gray-500">{doc.description || 'Aucune description'}</p>
                </div>
                <a
                  href={`/api/documents/${doc.id}/download`}
                  className="text-primary-600 hover:underline text-sm"
                  download
                >
                  Télécharger
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer l'intervention"
        message="Êtes-vous sûr de vouloir supprimer cette intervention ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
};

export default InterventionDetailPage;


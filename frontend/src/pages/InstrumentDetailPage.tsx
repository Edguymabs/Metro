import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { instrumentService } from '../services/instrumentService';
import { documentService } from '../services/documentService';
import { Instrument } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import FileUpload from '../components/upload/FileUpload';
import DocumentList from '../components/upload/DocumentList';
import Modal from '../components/common/Modal';
import { useToast } from '../contexts/ToastContext';
import { formatDate, formatCurrency, formatCalibrationFrequency } from '../utils/format';
import { Edit, Trash2, ArrowLeft, Calendar, FileText, Truck, Upload, Plus } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';

const InstrumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');

  useEffect(() => {
    if (id) {
      loadInstrument(id);
    }
  }, [id]);

  const loadInstrument = async (instrumentId: string) => {
    try {
      const data = await instrumentService.getById(instrumentId);
      setInstrument(data);
    } catch (error) {
      showToast('Erreur lors du chargement de l\'instrument', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !id) return;

    setUploading(true);
    try {
      await documentService.upload(selectedFile, id, undefined, fileDescription);
      showToast('Document uploadé avec succès', 'success');
      setShowUploadModal(false);
      setSelectedFile(null);
      setFileDescription('');
      loadInstrument(id);
    } catch (error) {
      showToast('Erreur lors de l\'upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDelete = () => {
    if (id) {
      loadInstrument(id);
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await instrumentService.delete(id);
      showToast('Instrument supprimé avec succès', 'success');
      navigate('/instruments');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('Erreur lors de la suppression de l\'instrument', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!instrument) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Instrument non trouvé</p>
        <Link to="/instruments" className="mt-4 inline-block text-primary-600 hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/instruments" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{instrument.name}</h1>
            <p className="mt-1 text-gray-600">{instrument.serialNumber}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to={`/instruments/${id}/modifier`} className="btn-secondary">
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
            <label className="text-sm font-medium text-gray-600">Numéro de série</label>
            <p className="mt-1 text-gray-900">{instrument.serialNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Référence interne</label>
            <p className="mt-1 text-gray-900">{instrument.internalReference || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Marque</label>
            <p className="mt-1 text-gray-900">{instrument.brand || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Modèle</label>
            <p className="mt-1 text-gray-900">{instrument.model || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Type</label>
            <p className="mt-1 text-gray-900">{instrument.type?.name || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Site</label>
            <p className="mt-1 text-gray-900">{instrument.site?.name || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Localisation</label>
            <p className="mt-1 text-gray-900">{instrument.location || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Statut</label>
            <div className="mt-1">
              <StatusBadge status={instrument.status} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Fréquence d'étalonnage</label>
            <p className="mt-1 text-gray-900">
              {formatCalibrationFrequency(
                instrument.calibrationFrequencyValue || instrument.calibrationPeriod,
                instrument.calibrationFrequencyUnit || 'MONTHS'
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Prochain étalonnage</label>
            <p className="mt-1 text-gray-900">{formatDate(instrument.nextCalibrationDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Date d'achat</label>
            <p className="mt-1 text-gray-900">{formatDate(instrument.purchaseDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Prix d'achat</label>
            <p className="mt-1 text-gray-900">{formatCurrency(instrument.purchasePrice)}</p>
          </div>
        </div>
        {instrument.observations && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-600">Observations</label>
            <p className="mt-1 text-gray-900">{instrument.observations}</p>
          </div>
        )}
      </div>

      {/* Historique des interventions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            <Calendar className="inline-block w-5 h-5 mr-2" />
            Historique des interventions
          </h2>
          <Link
            to={`/interventions/nouvelle?instrumentId=${id}`}
            className="text-primary-600 hover:underline text-sm"
          >
            + Nouvelle intervention
          </Link>
        </div>
        {instrument.interventions && instrument.interventions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Résultat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {instrument.interventions.map((intervention) => (
                  <tr key={intervention.id}>
                    <td className="px-4 py-3 text-sm">{formatDate(intervention.scheduledDate)}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={intervention.type} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={intervention.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {intervention.conformityResult ? (
                        <StatusBadge status={intervention.conformityResult} />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{intervention.supplier?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        to={`/interventions/${intervention.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucune intervention enregistrée</p>
        )}
      </div>

      {/* Documents */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            <FileText className="inline-block w-5 h-5 mr-2" />
            Documents
          </h2>
          <button onClick={() => setShowUploadModal(true)} className="btn-secondary">
            <Upload className="inline-block w-4 h-4 mr-2" />
            Ajouter un document
          </button>
        </div>
        <DocumentList
          documents={instrument.documents || []}
          onDelete={handleDocumentDelete}
        />
      </div>

      {/* Mouvements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            <Truck className="inline-block w-5 h-5 mr-2" />
            Mouvements
          </h2>
          <Link
            to={`/mouvements/nouveau?instrumentId=${id}`}
            className="btn-secondary"
          >
            <Plus className="inline-block w-4 h-4 mr-2" />
            Nouveau mouvement
          </Link>
        </div>
        {instrument.movements && instrument.movements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retour prévu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retour effectif</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {instrument.movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={movement.type} />
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(movement.departureDate)}</td>
                    <td className="px-4 py-3 text-sm">
                      {movement.toSite?.name || movement.externalLocation || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(movement.expectedReturnDate)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(movement.actualReturnDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucun mouvement enregistré</p>
        )}
      </div>

      {/* Modal d'upload de document */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
          setFileDescription('');
        }}
        title="Ajouter un document"
        size="md"
      >
        <div className="space-y-4">
          <FileUpload onFileSelect={handleFileSelect} />
          
          {selectedFile && (
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnelle)
              </label>
              <textarea
                id="description"
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Décrivez le contenu du document..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setFileDescription('');
              }}
              className="btn-secondary"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              onClick={handleUpload}
              className="btn-primary"
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Upload en cours...' : 'Uploader'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer l'instrument"
        message="Êtes-vous sûr de vouloir supprimer cet instrument ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
};

export default InstrumentDetailPage;


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supplierService } from '../services/supplierService';
import { Supplier } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Edit, Trash2, ArrowLeft, Mail, Phone, MapPin, Award } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';

const SupplierDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadSupplier(id);
    }
  }, [id]);

  const loadSupplier = async (supplierId: string) => {
    try {
      const data = await supplierService.getById(supplierId);
      setSupplier(data);
    } catch (error) {
      showToast('Erreur lors du chargement du fournisseur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await supplierService.delete(id);
      showToast('Fournisseur supprimé avec succès', 'success');
      navigate('/fournisseurs');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Fournisseur non trouvé</p>
        <Link to="/fournisseurs" className="mt-4 inline-block text-primary hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Fournisseurs', href: '/fournisseurs' },
          { label: supplier.name },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/fournisseurs')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
            {supplier.contactName && (
              <p className="mt-1 text-gray-600">Contact: {supplier.contactName}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to={`/fournisseurs/${id}/modifier`} className="btn-secondary">
            <Edit className="inline-block w-4 h-4 mr-2" />
            Modifier
          </Link>
          <button onClick={() => setShowDeleteDialog(true)} className="btn-danger">
            <Trash2 className="inline-block w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations de contact */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de contact</h2>
          <div className="space-y-4">
            {supplier.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                    {supplier.email}
                  </a>
                </div>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <a href={`tel:${supplier.phone}`} className="text-primary hover:underline">
                    {supplier.phone}
                  </a>
                </div>
              </div>
            )}
            {(supplier.address || supplier.city || supplier.postalCode) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="text-gray-900">
                    {supplier.address && <>{supplier.address}<br /></>}
                    {supplier.postalCode} {supplier.city}
                    <br />
                    {supplier.country}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Accréditations */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Accréditations
          </h2>
          {supplier.accreditations && supplier.accreditations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {supplier.accreditations.map((acc) => (
                <span
                  key={acc}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {acc}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune accréditation enregistrée</p>
          )}
        </div>
      </div>

      {/* Notes */}
      {supplier.notes && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>
        </div>
      )}

      {/* Interventions réalisées */}
      {supplier.interventions && supplier.interventions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Interventions réalisées ({supplier.interventions.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instrument
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplier.interventions.map((intervention) => (
                  <tr key={intervention.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/interventions/${intervention.id}`}
                        className="text-primary hover:underline"
                      >
                        {intervention.instrument?.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {intervention.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(intervention.scheduledDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{intervention.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer le fournisseur"
        message="Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
};

export default SupplierDetailPage;


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { siteService } from '../services/siteService';
import { Site } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/common/Breadcrumbs';
import StatusBadge from '../components/StatusBadge';
import { Edit, Trash2, ArrowLeft, MapPin, Mail, Phone, User, Wrench } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';

const SiteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadSite(id);
    }
  }, [id]);

  const loadSite = async (siteId: string) => {
    try {
      const data = await siteService.getById(siteId);
      setSite(data);
    } catch (error) {
      showToast('Erreur lors du chargement du site', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await siteService.delete(id);
      showToast('Site supprimé avec succès', 'success');
      navigate('/sites');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Site non trouvé</p>
        <Link to="/sites" className="mt-4 inline-block text-primary-600 hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const stats = {
    total: site.instruments?.length || 0,
    conforme: site.instruments?.filter((i) => i.status === 'CONFORME').length || 0,
    nonConforme: site.instruments?.filter((i) => i.status === 'NON_CONFORME').length || 0,
    enMaintenance: site.instruments?.filter((i) => i.status === 'EN_MAINTENANCE').length || 0,
    casse: site.instruments?.filter((i) => i.status === 'CASSE').length || 0,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Sites', href: '/sites' },
          { label: site.name },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/sites')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
            {site.code && <p className="mt-1 text-gray-600">Code: {site.code}</p>}
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to={`/sites/${id}/modifier`} className="btn-secondary">
            <Edit className="inline-block w-4 h-4 mr-2" />
            Modifier
          </Link>
          <button onClick={() => setShowDeleteDialog(true)} className="btn-danger">
            <Trash2 className="inline-block w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total instruments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Conformes</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.conforme}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Non conformes</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.nonConforme}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">En maintenance</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.enMaintenance}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Cassés</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{stats.casse}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations du site */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du site</h2>
          <div className="space-y-4">
            {(site.address || site.city || site.postalCode) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="text-gray-900">
                    {site.address && <>{site.address}<br /></>}
                    {site.postalCode} {site.city}
                    <br />
                    {site.country}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact sur site */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact sur site
          </h2>
          {site.contactName || site.contactEmail || site.contactPhone ? (
            <div className="space-y-3">
              {site.contactName && (
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="text-gray-900">{site.contactName}</p>
                </div>
              )}
              {site.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${site.contactEmail}`} className="text-primary-600 hover:underline text-sm">
                    {site.contactEmail}
                  </a>
                </div>
              )}
              {site.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${site.contactPhone}`} className="text-primary-600 hover:underline text-sm">
                    {site.contactPhone}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucun contact enregistré</p>
          )}
        </div>
      </div>

      {/* Liste des instruments */}
      {site.instruments && site.instruments.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Instruments sur site ({site.instruments.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro de série
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emplacement
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {site.instruments.map((instrument) => (
                  <tr key={instrument.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/instruments/${instrument.id}`}
                        className="text-primary-600 hover:underline font-medium"
                      >
                        {instrument.serialNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {instrument.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {instrument.type?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={instrument.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {instrument.location || '-'}
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
        title="Supprimer le site"
        message="Êtes-vous sûr de vouloir supprimer ce site ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
};

export default SiteDetailPage;


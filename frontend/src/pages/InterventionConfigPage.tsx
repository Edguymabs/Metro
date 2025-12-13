import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Copy, Download, Settings, CheckCircle, XCircle, Eye } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { interventionConfigService } from '../services/interventionConfigService';
import { InterventionMenuConfig, InterventionConfigTemplate, INTERVENTION_CONFIG_TEMPLATES } from '../types/interventionConfig';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Breadcrumbs from '../components/common/Breadcrumbs';

const InterventionConfigPage: React.FC = () => {
  const { showToast } = useToast();
  const [configs, setConfigs] = useState<InterventionMenuConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const data = await interventionConfigService.getAll();
      setConfigs(data);
    } catch (error) {
      showToast('Erreur lors du chargement des configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await interventionConfigService.delete(deleteId);
      showToast('Configuration supprimée avec succès', 'success');
      loadConfigs();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await interventionConfigService.setActive(id);
      showToast('Configuration activée avec succès', 'success');
      loadConfigs();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de l\'activation', 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const config = configs.find(c => c.id === id);
      const newName = `${config?.name} (Copie)`;
      await interventionConfigService.duplicate(id, newName);
      showToast('Configuration dupliquée avec succès', 'success');
      loadConfigs();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la duplication', 'error');
    }
  };

  const handleCreateFromTemplate = async (template: InterventionConfigTemplate) => {
    try {
      await interventionConfigService.createFromTemplate(
        template.id,
        `${template.name} - ${new Date().toLocaleDateString()}`,
        `Configuration créée depuis le template ${template.name}`
      );
      showToast('Configuration créée depuis le template', 'success');
      loadConfigs();
      setShowTemplates(false);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la création', 'error');
    }
  };

  const handleExport = async (id: string) => {
    try {
      const blob = await interventionConfigService.export(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intervention-config-${id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Configuration exportée avec succès', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de l\'export', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/' },
          { label: 'Paramètres', href: '/parametres' },
          { label: 'Configuration des interventions' }
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuration des Interventions</h1>
          <p className="mt-1 text-gray-600">
            Personnalisez les menus et options des interventions selon vos besoins
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Templates
          </button>
          <Link to="/parametres/interventions/nouvelle" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle configuration
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="alert-info p-4">
        <div className="flex gap-3">
          <Settings className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-800">
            <p className="font-medium">À propos de la configuration des interventions</p>
            <p className="mt-1">
              Personnalisez les types d'intervention, statuts et résultats de conformité selon votre secteur d'activité.
              Vous pouvez créer plusieurs configurations et basculer entre elles selon vos besoins.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des configurations */}
      {configs.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune configuration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer une configuration ou utilisez un template
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => setShowTemplates(true)}
              className="btn-secondary"
            >
              Utiliser un template
            </button>
            <Link to="/parametres/interventions/nouvelle" className="btn-primary">
              Créer une configuration
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {configs.map((config) => (
            <div
              key={config.id}
              className="card p-6 hover:shadow-premium-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                    {config.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    )}
                    {config.isDefault && (
                      <span className="badge badge-info">
                        Par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Types d'intervention</span>
                  <span className="font-medium">{config.interventionTypes.filter(t => t.isActive).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Statuts</span>
                  <span className="font-medium">{config.statuses.filter(s => s.isActive).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Résultats de conformité</span>
                  <span className="font-medium">{config.conformityResults.filter(r => r.isActive).length}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Link
                  to={`/parametres/interventions/${config.id}`}
                  className="flex-1 text-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4 mx-auto mb-1" />
                  Voir
                </Link>
                <Link
                  to={`/parametres/interventions/${config.id}/modifier`}
                  className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mx-auto mb-1" />
                  Modifier
                </Link>
                <button
                  onClick={() => handleDuplicate(config.id)}
                  className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 mx-auto mb-1" />
                  Copier
                </button>
                <button
                  onClick={() => handleExport(config.id)}
                  className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mx-auto mb-1" />
                  Export
                </button>
              </div>

              {!config.isActive && !config.isDefault && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleSetActive(config.id)}
                    className="w-full btn-primary text-sm"
                  >
                    Activer cette configuration
                  </button>
                </div>
              )}

              {!config.isDefault && (
                <div className="mt-2">
                  <button
                    onClick={() => setDeleteId(config.id)}
                    className="w-full text-sm text-red-600 hover:text-red-900 hover:bg-red-50 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mx-auto mb-1" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal des templates */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Templates de configuration</h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choisissez un template adapté à votre secteur d'activité
              </p>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {INTERVENTION_CONFIG_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Secteur: {template.industry}</p>
                    <button
                      onClick={() => handleCreateFromTemplate(template)}
                      className="mt-3 w-full btn-primary text-sm"
                    >
                      Utiliser ce template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer la configuration"
        message="Êtes-vous sûr de vouloir supprimer cette configuration ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
};

export default InterventionConfigPage;

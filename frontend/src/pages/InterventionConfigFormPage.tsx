import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { interventionConfigService } from '../services/interventionConfigService';
import { InterventionMenuConfig, MenuOption, DEFAULT_INTERVENTION_CONFIG } from '../types/interventionConfig';
import FormField from '../components/common/FormField';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';

const InterventionConfigFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'types' | 'statuses' | 'results' | 'fields' | 'validations'>('types');

  const [formData, setFormData] = useState<Partial<InterventionMenuConfig>>({
    name: '',
    description: '',
    isActive: false,
    interventionTypes: [],
    statuses: [],
    conformityResults: [],
    conditionalFields: {
      showNextCalibrationDate: [],
      showCertificateNumber: [],
      showCost: [],
      showObservations: []
    },
    validations: {
      requireSupplier: [],
      requireConformityResult: [],
      requireCompletedDate: []
    }
  });

  useEffect(() => {
    if (isEdit) {
      loadConfig();
    } else {
      // Initialiser avec la configuration par défaut
      setFormData({
        ...DEFAULT_INTERVENTION_CONFIG,
        id: undefined,
        name: '',
        description: '',
        isDefault: false,
        isActive: false
      });
      setLoading(false);
    }
  }, [id]);

  const loadConfig = async () => {
    try {
      const config = await interventionConfigService.getById(id!);
      setFormData(config);
    } catch (error) {
      showToast('Erreur lors du chargement de la configuration', 'error');
      navigate('/parametres/interventions');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOption = (field: 'interventionTypes' | 'statuses' | 'conformityResults') => {
    const newOption: MenuOption = {
      value: '',
      label: '',
      description: '',
      color: '#6b7280',
      icon: 'circle',
      isActive: true
    };

    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), newOption]
    }));
  };

  const handleUpdateOption = (
    field: 'interventionTypes' | 'statuses' | 'conformityResults',
    index: number,
    option: MenuOption
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.map((item, i) => i === index ? option : item) || []
    }));
  };

  const handleRemoveOption = (
    field: 'interventionTypes' | 'statuses' | 'conformityResults',
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleToggleOption = (
    field: 'interventionTypes' | 'statuses' | 'conformityResults',
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.map((item, i) => 
        i === index ? { ...item, isActive: !item.isActive } : item
      ) || []
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (isEdit) {
        await interventionConfigService.update(id!, formData);
        showToast('Configuration mise à jour avec succès', 'success');
      } else {
        await interventionConfigService.create(formData);
        showToast('Configuration créée avec succès', 'success');
      }
      
      navigate('/parametres/interventions');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'types', label: 'Types d\'intervention', count: formData.interventionTypes?.length || 0 },
    { id: 'statuses', label: 'Statuts', count: formData.statuses?.length || 0 },
    { id: 'results', label: 'Résultats de conformité', count: formData.conformityResults?.length || 0 },
    { id: 'fields', label: 'Champs conditionnels', count: 0 },
    { id: 'validations', label: 'Validations', count: 0 }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/' },
          { label: 'Paramètres', href: '/parametres' },
          { label: 'Configuration des interventions', href: '/parametres/interventions' },
          { label: isEdit ? 'Modifier' : 'Nouvelle configuration' }
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/parametres/interventions')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Modifier la configuration' : 'Nouvelle configuration'}
            </h1>
            <p className="mt-1 text-gray-600">
              Personnalisez les menus et options des interventions
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Informations générales */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Nom de la configuration"
            name="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Ex: Configuration Laboratoire"
          />
          <FormField
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Description de cette configuration"
          />
        </div>
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Types d'intervention */}
          {activeTab === 'types' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Types d'intervention</h3>
                <button
                  onClick={() => handleAddOption('interventionTypes')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un type
                </button>
              </div>
              <div className="space-y-3">
                {formData.interventionTypes?.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-pem">
                    <button
                      onClick={() => handleToggleOption('interventionTypes', index)}
                      className={`p-1 rounded ${
                        option.isActive ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {option.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => handleUpdateOption('interventionTypes', index, { ...option, value: e.target.value })}
                      placeholder="Valeur (ex: ETALONNAGE)"
                      className="flex-1 input-field"
                    />
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => handleUpdateOption('interventionTypes', index, { ...option, label: e.target.value })}
                      placeholder="Libellé (ex: Étalonnage)"
                      className="flex-1 input-field"
                    />
                    <input
                      type="text"
                      value={option.description || ''}
                      onChange={(e) => handleUpdateOption('interventionTypes', index, { ...option, description: e.target.value })}
                      placeholder="Description"
                      className="flex-1 input-field"
                    />
                    <input
                      type="color"
                      value={option.color || '#6b7280'}
                      onChange={(e) => handleUpdateOption('interventionTypes', index, { ...option, color: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-300"
                    />
                    <button
                      onClick={() => handleRemoveOption('interventionTypes', index)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statuts */}
          {activeTab === 'statuses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Statuts d'intervention</h3>
                <button
                  onClick={() => handleAddOption('statuses')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un statut
                </button>
              </div>
              <div className="space-y-3">
                {formData.statuses?.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-pem">
                    <button
                      onClick={() => handleToggleOption('statuses', index)}
                      className={`p-1 rounded ${
                        option.isActive ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {option.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => handleUpdateOption('statuses', index, { ...option, value: e.target.value })}
                      placeholder="Valeur (ex: PLANIFIEE)"
                      className="flex-1 input-field"
                    />
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => handleUpdateOption('statuses', index, { ...option, label: e.target.value })}
                      placeholder="Libellé (ex: Planifiée)"
                      className="flex-1 input-field"
                    />
                    <input
                      type="text"
                      value={option.description || ''}
                      onChange={(e) => handleUpdateOption('statuses', index, { ...option, description: e.target.value })}
                      placeholder="Description"
                      className="flex-1 input-field"
                    />
                    <input
                      type="color"
                      value={option.color || '#6b7280'}
                      onChange={(e) => handleUpdateOption('statuses', index, { ...option, color: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-300"
                    />
                    <button
                      onClick={() => handleRemoveOption('statuses', index)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Résultats de conformité */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Résultats de conformité</h3>
                <button
                  onClick={() => handleAddOption('conformityResults')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un résultat
                </button>
              </div>
              <div className="space-y-3">
                {formData.conformityResults?.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-pem">
                    <button
                      onClick={() => handleToggleOption('conformityResults', index)}
                      className={`p-1 rounded ${
                        option.isActive ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {option.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => handleUpdateOption('conformityResults', index, { ...option, value: e.target.value })}
                      placeholder="Valeur (ex: CONFORME)"
                      className="flex-1 input-field"
                    />
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => handleUpdateOption('conformityResults', index, { ...option, label: e.target.value })}
                      placeholder="Libellé (ex: Conforme)"
                      className="flex-1 input-field"
                    />
                    <input
                      type="text"
                      value={option.description || ''}
                      onChange={(e) => handleUpdateOption('conformityResults', index, { ...option, description: e.target.value })}
                      placeholder="Description"
                      className="flex-1 input-field"
                    />
                    <input
                      type="color"
                      value={option.color || '#6b7280'}
                      onChange={(e) => handleUpdateOption('conformityResults', index, { ...option, color: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-300"
                    />
                    <button
                      onClick={() => handleRemoveOption('conformityResults', index)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Champs conditionnels */}
          {activeTab === 'fields' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Champs conditionnels</h3>
              <p className="text-sm text-gray-600">
                Définissez quels champs s'affichent selon le type d'intervention sélectionné.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Afficher "Prochaine date d'étalonnage" pour :
                  </label>
                  <div className="space-y-2">
                    {formData.interventionTypes?.filter(t => t.isActive).map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.conditionalFields?.showNextCalibrationDate?.includes(type.value) || false}
                          onChange={(e) => {
                            const current = formData.conditionalFields?.showNextCalibrationDate || [];
                            const updated = e.target.checked
                              ? [...current, type.value]
                              : current.filter(v => v !== type.value);
                            handleChange('conditionalFields', { ...formData.conditionalFields, showNextCalibrationDate: updated });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Afficher "Numéro de certificat" pour :
                  </label>
                  <div className="space-y-2">
                    {formData.interventionTypes?.filter(t => t.isActive).map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.conditionalFields?.showCertificateNumber?.includes(type.value) || false}
                          onChange={(e) => {
                            const current = formData.conditionalFields?.showCertificateNumber || [];
                            const updated = e.target.checked
                              ? [...current, type.value]
                              : current.filter(v => v !== type.value);
                            handleChange('conditionalFields', { ...formData.conditionalFields, showCertificateNumber: updated });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Afficher "Coût" pour :
                  </label>
                  <div className="space-y-2">
                    {formData.interventionTypes?.filter(t => t.isActive).map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.conditionalFields?.showCost?.includes(type.value) || false}
                          onChange={(e) => {
                            const current = formData.conditionalFields?.showCost || [];
                            const updated = e.target.checked
                              ? [...current, type.value]
                              : current.filter(v => v !== type.value);
                            handleChange('conditionalFields', { ...formData.conditionalFields, showCost: updated });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Afficher "Observations" pour :
                  </label>
                  <div className="space-y-2">
                    {formData.interventionTypes?.filter(t => t.isActive).map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.conditionalFields?.showObservations?.includes(type.value) || false}
                          onChange={(e) => {
                            const current = formData.conditionalFields?.showObservations || [];
                            const updated = e.target.checked
                              ? [...current, type.value]
                              : current.filter(v => v !== type.value);
                            handleChange('conditionalFields', { ...formData.conditionalFields, showObservations: updated });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validations */}
          {activeTab === 'validations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Règles de validation</h3>
              <p className="text-sm text-gray-600">
                Définissez quels champs sont obligatoires selon le contexte.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fournisseur obligatoire pour :
                  </label>
                  <div className="space-y-2">
                    {formData.interventionTypes?.filter(t => t.isActive).map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.validations?.requireSupplier?.includes(type.value) || false}
                          onChange={(e) => {
                            const current = formData.validations?.requireSupplier || [];
                            const updated = e.target.checked
                              ? [...current, type.value]
                              : current.filter(v => v !== type.value);
                            handleChange('validations', { ...formData.validations, requireSupplier: updated });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Résultat de conformité obligatoire pour :
                  </label>
                  <div className="space-y-2">
                    {formData.statuses?.filter(s => s.isActive).map((status) => (
                      <label key={status.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.validations?.requireConformityResult?.includes(status.value) || false}
                          onChange={(e) => {
                            const current = formData.validations?.requireConformityResult || [];
                            const updated = e.target.checked
                              ? [...current, status.value]
                              : current.filter(v => v !== status.value);
                            handleChange('validations', { ...formData.validations, requireConformityResult: updated });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin obligatoire pour :
                  </label>
                  <div className="space-y-2">
                    {formData.statuses?.filter(s => s.isActive).map((status) => (
                      <label key={status.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.validations?.requireCompletedDate?.includes(status.value) || false}
                          onChange={(e) => {
                            const current = formData.validations?.requireCompletedDate || [];
                            const updated = e.target.checked
                              ? [...current, status.value]
                              : current.filter(v => v !== status.value);
                            handleChange('validations', { ...formData.validations, requireCompletedDate: updated });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterventionConfigFormPage;

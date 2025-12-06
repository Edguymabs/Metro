import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { interventionService } from '../services/interventionService';
import { instrumentService } from '../services/instrumentService';
import { supplierService } from '../services/supplierService';
import { interventionConfigService } from '../services/interventionConfigService';
import { Instrument, Supplier } from '../types';
import { InterventionMenuConfig } from '../types/interventionConfig';
import FormField from '../components/common/FormField';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Info, Settings } from 'lucide-react';

const InterventionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [interventionConfig, setInterventionConfig] = useState<InterventionMenuConfig | null>(null);

  const [formData, setFormData] = useState({
    instrumentId: searchParams.get('instrumentId') || '',
    type: 'ETALONNAGE',
    status: 'PLANIFIEE',
    scheduledDate: '',
    completedDate: '',
    conformityResult: '',
    cost: '',
    observations: '',
    certificateNumber: '',
    nextCalibrationDate: '',
    supplierId: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    // Charger l'instrument sélectionné
    if (formData.instrumentId) {
      const instrument = instruments.find((i) => i.id === formData.instrumentId);
      setSelectedInstrument(instrument || null);
    }
  }, [formData.instrumentId, instruments]);

  const loadData = async () => {
    try {
      const [instrumentsData, suppliersData, configData] = await Promise.all([
        instrumentService.getAll(),
        supplierService.getAll(),
        interventionConfigService.getActive(),
      ]);
      setInstruments(instrumentsData);
      setSuppliers(suppliersData);
      setInterventionConfig(configData);

      // Initialiser avec le premier type d'intervention actif
      if (configData.interventionTypes.length > 0) {
        const firstActiveType = configData.interventionTypes.find(t => t.isActive);
        if (firstActiveType) {
          setFormData(prev => ({ ...prev, type: firstActiveType.value }));
        }
      }

      // Initialiser avec le premier statut actif
      if (configData.statuses.length > 0) {
        const firstActiveStatus = configData.statuses.find(s => s.isActive);
        if (firstActiveStatus) {
          setFormData(prev => ({ ...prev, status: firstActiveStatus.value }));
        }
      }

      if (id) {
        const intervention = await interventionService.getById(id);
        setFormData({
          instrumentId: intervention.instrument?.id || '',
          type: intervention.type,
          status: intervention.status,
          scheduledDate: intervention.scheduledDate.split('T')[0],
          completedDate: intervention.completedDate
            ? intervention.completedDate.split('T')[0]
            : '',
          conformityResult: intervention.conformityResult || '',
          cost: intervention.cost?.toString() || '',
          observations: intervention.observations || '',
          certificateNumber: intervention.certificateNumber || '',
          nextCalibrationDate: intervention.nextCalibrationDate
            ? intervention.nextCalibrationDate.split('T')[0]
            : '',
          supplierId: intervention.supplier?.id || '',
        });
      }
    } catch (error) {
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires pour la configuration
  const shouldShowField = (fieldName: string): boolean => {
    if (!interventionConfig) return false;
    const conditionalFields = interventionConfig.conditionalFields;
    return conditionalFields[fieldName as keyof typeof conditionalFields]?.includes(formData.type) || false;
  };

  const isFieldRequired = (fieldName: string): boolean => {
    if (!interventionConfig) return false;
    const validations = interventionConfig.validations;
    return validations[fieldName as keyof typeof validations]?.includes(formData.type) || 
           validations[fieldName as keyof typeof validations]?.includes(formData.status) || false;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate next calibration date for ETALONNAGE
    if (
      name === 'completedDate' &&
      value &&
      formData.type === 'ETALONNAGE' &&
      selectedInstrument
    ) {
      const date = new Date(value);
      date.setMonth(date.getMonth() + selectedInstrument.calibrationPeriod);
      setFormData((prev) => ({
        ...prev,
        nextCalibrationDate: date.toISOString().split('T')[0],
      }));
    }

    // Reset conformity result if status is not TERMINEE
    if (name === 'status' && value !== 'TERMINEE') {
      setFormData((prev) => ({ ...prev, conformityResult: '', completedDate: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        type: formData.type as any,
        status: formData.status as any,
        conformityResult: formData.conformityResult as any,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        completedDate: formData.completedDate || undefined,
        nextCalibrationDate: formData.nextCalibrationDate || undefined,
      };

      if (isEdit) {
        await interventionService.update(id!, data);
        showToast('Intervention modifiée avec succès', 'success');
      } else {
        await interventionService.create(data);
        showToast('Intervention créée avec succès', 'success');
      }

      if (formData.instrumentId) {
        navigate(`/instruments/${formData.instrumentId}`);
      } else {
        navigate('/interventions');
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erreur lors de l\'enregistrement',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Interventions', href: '/interventions' },
          { label: isEdit ? 'Modifier' : 'Nouvelle' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isEdit
              ? 'Modifiez les informations de l\'intervention'
              : 'Planifiez une nouvelle intervention'}
          </p>
          {interventionConfig && (
            <p className="mt-1 text-sm text-blue-600">
              Configuration active : {interventionConfig.name}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/parametres/interventions')}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurer
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            <ArrowLeft className="inline-block w-4 h-4 mr-2" />
            Retour
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instrument */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Instrument concerné</h2>
          </div>

          <div className="md:col-span-2">
            <FormField
              label="Instrument"
              name="instrumentId"
              type="select"
              value={formData.instrumentId}
              onChange={handleChange}
              required
              options={instruments.map((i) => ({
                value: i.id,
                label: `${i.serialNumber} - ${i.name}`,
              }))}
            />
            {selectedInstrument && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p>
                      <strong>Type:</strong> {selectedInstrument.type?.name || '-'} |{' '}
                      <strong>Site:</strong> {selectedInstrument.site?.name || '-'}
                    </p>
                    <p>
                      <strong>Périodicité:</strong> {selectedInstrument.calibrationPeriod} mois
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Type et statut */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de l'intervention</h2>
          </div>

          <FormField
            label="Type d'intervention"
            name="type"
            type="select"
            value={formData.type}
            onChange={handleChange}
            required
            options={interventionConfig?.interventionTypes
              ?.filter(type => type.isActive)
              ?.map(type => ({ value: type.value, label: type.label })) || []}
          />

          <FormField
            label="Statut"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            required
            options={interventionConfig?.statuses
              ?.filter(status => status.isActive)
              ?.map(status => ({ value: status.value, label: status.label })) || []}
          />

          <FormField
            label="Fournisseur / Prestataire"
            name="supplierId"
            type="select"
            value={formData.supplierId}
            onChange={handleChange}
            required={isFieldRequired('requireSupplier')}
            options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
          />

          {/* Champs conditionnels selon la configuration */}
          {shouldShowField('showCost') && (
            <FormField
              label="Coût estimé / réel (€)"
              name="cost"
              type="number"
              value={formData.cost}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          )}

          {/* Dates */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Planification</h2>
          </div>

          <FormField
            label="Date prévue"
            name="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
          />

          {formData.status === 'TERMINEE' && (
            <FormField
              label="Date de réalisation"
              name="completedDate"
              type="date"
              value={formData.completedDate}
              onChange={handleChange}
              required={formData.status === 'TERMINEE'}
            />
          )}

          {/* Résultats (si terminée) */}
          {formData.status === 'TERMINEE' && (
            <>
              <div className="md:col-span-2 mt-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Résultats</h2>
              </div>

              <FormField
                label="Résultat de conformité"
                name="conformityResult"
                type="select"
                value={formData.conformityResult}
                onChange={handleChange}
                required={isFieldRequired('requireConformityResult')}
                options={interventionConfig?.conformityResults
                  ?.filter(result => result.isActive)
                  ?.map(result => ({ value: result.value, label: result.label })) || []}
              />

              {shouldShowField('showCertificateNumber') && (
                <FormField
                  label="Numéro de certificat"
                  name="certificateNumber"
                  value={formData.certificateNumber}
                  onChange={handleChange}
                  placeholder="CERT-2024-001"
                />
              )}

              {shouldShowField('showNextCalibrationDate') && (
                <FormField
                  label="Prochaine date d'étalonnage"
                  name="nextCalibrationDate"
                  type="date"
                  value={formData.nextCalibrationDate}
                  onChange={handleChange}
                  helperText="Calculée automatiquement selon la périodicité"
                />
              )}
            </>
          )}

          {/* Observations */}
          {shouldShowField('showObservations') && (
            <div className="md:col-span-2 mt-4">
              <FormField
                label="Observations"
                name="observations"
                type="textarea"
                value={formData.observations}
                onChange={handleChange}
                rows={4}
                placeholder="Notes ou commentaires..."
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={saving}
          >
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer l\'intervention'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterventionFormPage;


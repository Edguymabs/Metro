import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { calibrationMethodService } from '../services/calibrationMethodService';
import { instrumentTypeService } from '../services/instrumentTypeService';
import AdvancedCalibrationScheduler from '../components/forms/AdvancedCalibrationScheduler';

interface InstrumentType {
  id: string;
  name: string;
}

const CalibrationMethodFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentType[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instrumentTypeId: '',
    recurrenceType: 'FIXED_INTERVAL' as any,
    frequencyValue: 12,
    frequencyUnit: 'MONTHS' as any,
    daysOfWeek: [] as string[],
    dayOfMonth: undefined as number | undefined,
    monthOfYear: undefined as number | undefined,
    dayOfYear: undefined as number | undefined,
    toleranceValue: 0,
    toleranceUnit: 'DAYS' as any,
    procedure: '',
    requiredEquipment: '',
    estimatedDuration: undefined as number | undefined,
  });

  useEffect(() => {
    loadInstrumentTypes();
    if (id) {
      loadMethod();
    }
  }, [id]);

  const loadInstrumentTypes = async () => {
    try {
      const data = await instrumentTypeService.getAll();
      setInstrumentTypes(data);
    } catch (error) {
      showToast('Erreur lors du chargement des types d\'instruments', 'error');
    }
  };

  const loadMethod = async () => {
    try {
      const data = await calibrationMethodService.getById(id!);
      setFormData({
        name: data.name,
        description: data.description || '',
        instrumentTypeId: data.instrumentTypeId || '',
        recurrenceType: data.recurrenceType as any,
        frequencyValue: data.frequencyValue || 12,
        frequencyUnit: data.frequencyUnit as any || 'MONTHS',
        daysOfWeek: data.daysOfWeek || [],
        dayOfMonth: data.dayOfMonth,
        monthOfYear: data.monthOfYear,
        dayOfYear: data.dayOfYear,
        toleranceValue: data.toleranceValue,
        toleranceUnit: data.toleranceUnit as any,
        procedure: data.procedure || '',
        requiredEquipment: data.requiredEquipment || '',
        estimatedDuration: data.estimatedDuration,
      });
    } catch (error) {
      showToast('Erreur lors du chargement de la méthode', 'error');
      navigate('/methodes-etalonnage');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        instrumentTypeId: formData.instrumentTypeId || undefined,
        estimatedDuration: formData.estimatedDuration || undefined,
      };

      if (id) {
        await calibrationMethodService.update(id, data);
        showToast('Méthode mise à jour avec succès', 'success');
      } else {
        await calibrationMethodService.create(data);
        showToast('Méthode créée avec succès', 'success');
      }

      navigate('/methodes-etalonnage');
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erreur lors de l\'enregistrement',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecurrenceChange = (config: any) => {
    setFormData((prev) => ({
      ...prev,
      recurrenceType: config.recurrenceType,
      frequencyValue: config.frequencyValue,
      frequencyUnit: config.frequencyUnit,
      daysOfWeek: config.daysOfWeek || [],
      dayOfMonth: config.dayOfMonth,
      monthOfYear: config.monthOfYear,
      dayOfYear: config.dayOfYear,
      toleranceValue: config.toleranceValue,
      toleranceUnit: config.toleranceUnit,
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/methodes-etalonnage')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Modifier la méthode' : 'Nouvelle méthode d\'étalonnage'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Créez un template réutilisable pour vos étalonnages
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la méthode *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
                placeholder="Ex: Étalonnage Balances - Hebdomadaire"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input"
                rows={3}
                placeholder="Description de la méthode d'étalonnage..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'instrument
              </label>
              <select
                value={formData.instrumentTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, instrumentTypeId: e.target.value })
                }
                className="input"
              >
                <option value="">Tous les types</option>
                {instrumentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Optionnel : associer à un type d'instrument spécifique
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée estimée (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDuration: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="input"
                min="1"
                placeholder="Ex: 30"
              />
            </div>
          </div>
        </div>

        {/* Configuration de récurrence et tolérance */}
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Récurrence et tolérance
          </h2>

          <AdvancedCalibrationScheduler
            schedule={{
              recurrenceType: formData.recurrenceType,
              frequencyValue: formData.frequencyValue,
              frequencyUnit: formData.frequencyUnit,
              daysOfWeek: formData.daysOfWeek as any[],
              dayOfMonth: formData.dayOfMonth,
              monthOfYear: formData.monthOfYear,
              dayOfYear: formData.dayOfYear,
              toleranceValue: formData.toleranceValue,
              toleranceUnit: formData.toleranceUnit,
            }}
            onChange={handleRecurrenceChange}
          />
        </div>

        {/* Procédure et équipements */}
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Procédure et équipements
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procédure d'étalonnage
            </label>
            <textarea
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              className="input"
              rows={4}
              placeholder="Décrivez la procédure d'étalonnage ou indiquez la référence (ex: BAL-001)..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipements requis
            </label>
            <textarea
              value={formData.requiredEquipment}
              onChange={(e) =>
                setFormData({ ...formData, requiredEquipment: e.target.value })
              }
              className="input"
              rows={3}
              placeholder="Liste des équipements nécessaires pour l'étalonnage..."
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/methodes-etalonnage')}
            className="btn-secondary"
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={submitting}
          >
            <Save className="w-5 h-5" />
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CalibrationMethodFormPage;


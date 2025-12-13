import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { calibrationCalendarService } from '../services/calibrationCalendarService';
import { calibrationMethodService, CalibrationMethod } from '../services/calibrationMethodService';
import { instrumentService } from '../services/instrumentService';
import AdvancedCalibrationScheduler from '../components/forms/AdvancedCalibrationScheduler';

interface Instrument {
  id: string;
  serialNumber: string;
  name: string;
  type?: { name: string };
}

const CalibrationCalendarFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [methods, setMethods] = useState<CalibrationMethod[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calibrationMethodId: '',
    recurrenceType: 'FIXED_INTERVAL' as any,
    frequencyValue: 12,
    frequencyUnit: 'MONTHS' as any,
    daysOfWeek: [] as string[],
    dayOfMonth: undefined as number | undefined,
    monthOfYear: undefined as number | undefined,
    dayOfYear: undefined as number | undefined,
    toleranceValue: 0,
    toleranceUnit: 'DAYS' as any,
    active: true,
  });

  useEffect(() => {
    loadMethods();
    loadInstruments();
    if (id) {
      loadCalendar();
    }
  }, [id]);

  const loadMethods = async () => {
    try {
      const data = await calibrationMethodService.getAll();
      setMethods(data);
    } catch (error) {
      showToast('Erreur lors du chargement des méthodes', 'error');
    }
  };

  const loadInstruments = async () => {
    try {
      const data = await instrumentService.getAll();
      setInstruments(data);
    } catch (error) {
      showToast('Erreur lors du chargement des instruments', 'error');
    }
  };

  const loadCalendar = async () => {
    try {
      const data = await calibrationCalendarService.getById(id!);
      setFormData({
        name: data.name,
        description: data.description || '',
        calibrationMethodId: data.calibrationMethodId || '',
        recurrenceType: data.recurrenceType as any,
        frequencyValue: data.frequencyValue || 12,
        frequencyUnit: data.frequencyUnit as any || 'MONTHS',
        daysOfWeek: data.daysOfWeek || [],
        dayOfMonth: data.dayOfMonth,
        monthOfYear: data.monthOfYear,
        dayOfYear: data.dayOfYear,
        toleranceValue: data.toleranceValue,
        toleranceUnit: data.toleranceUnit as any,
        active: data.active,
      });

      // Charger les instruments associés
      if (data.instruments) {
        setSelectedInstruments(data.instruments.map((i: any) => i.id));
      }
    } catch (error) {
      showToast('Erreur lors du chargement du calendrier', 'error');
      navigate('/calendriers-etalonnage');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (methodId: string) => {
    setFormData({ ...formData, calibrationMethodId: methodId });

    if (methodId) {
      const method = methods.find((m) => m.id === methodId);
      if (method) {
        // Pré-remplir avec les valeurs de la méthode
        setFormData((prev) => ({
          ...prev,
          calibrationMethodId: methodId,
          recurrenceType: method.recurrenceType as any,
          frequencyValue: method.frequencyValue || 12,
          frequencyUnit: method.frequencyUnit as any || 'MONTHS',
          daysOfWeek: method.daysOfWeek || [],
          dayOfMonth: method.dayOfMonth,
          monthOfYear: method.monthOfYear,
          dayOfYear: method.dayOfYear,
          toleranceValue: method.toleranceValue,
          toleranceUnit: method.toleranceUnit as any,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        calibrationMethodId: formData.calibrationMethodId || undefined,
        instrumentIds: selectedInstruments,
      };

      if (id) {
        await calibrationCalendarService.update(id, data);
        showToast('Calendrier mis à jour avec succès', 'success');
      } else {
        await calibrationCalendarService.create(data);
        showToast('Calendrier créé avec succès', 'success');
      }

      navigate('/calendriers-etalonnage');
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

  const toggleInstrument = (instrumentId: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(instrumentId)
        ? prev.filter((id) => id !== instrumentId)
        : [...prev, instrumentId]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/calendriers-etalonnage')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Modifier le calendrier' : 'Nouveau calendrier d\'étalonnage'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Créez une planification pour plusieurs instruments
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
                Nom du calendrier *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
                placeholder="Ex: Balances Production - Haute Criticité"
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
                placeholder="Description du calendrier..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Basé sur une méthode (optionnel)
              </label>
              <select
                value={formData.calibrationMethodId}
                onChange={(e) => handleMethodChange(e.target.value)}
                className="input"
              >
                <option value="">Configuration personnalisée</option>
                {methods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                    {method.instrumentType && ` (${method.instrumentType.name})`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Sélectionnez une méthode pour pré-remplir la configuration
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.active ? 'true' : 'false'}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.value === 'true' })
                }
                className="input"
              >
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
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

        {/* Sélection des instruments */}
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Instruments associés
          </h2>

          <p className="text-sm text-gray-600">
            Sélectionnez les instruments qui suivront ce calendrier d'étalonnage
          </p>

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-pem">
            {instruments.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                Aucun instrument disponible
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {instruments.map((instrument) => (
                  <label
                    key={instrument.id}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedInstruments.includes(instrument.id)}
                      onChange={() => toggleInstrument(instrument.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {instrument.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {instrument.serialNumber}
                        {instrument.type && ` • ${instrument.type.name}`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500">
            {selectedInstruments.length} instrument(s) sélectionné(s)
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/calendriers-etalonnage')}
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

export default CalibrationCalendarFormPage;


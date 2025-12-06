import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { instrumentService } from '../services/instrumentService';
import { siteService } from '../services/siteService';
import { instrumentTypeService } from '../services/instrumentTypeService';
import { calibrationMethodService } from '../services/calibrationMethodService';
import { Site, InstrumentType } from '../types';
import FormField from '../components/common/FormField';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { extractErrorDetails } from '../utils/errorHandler';
import { ArrowLeft } from 'lucide-react';

const InstrumentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [types, setTypes] = useState<InstrumentType[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [calibrationMode, setCalibrationMode] = useState<'advanced' | 'method'>('advanced');
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  const [formData, setFormData] = useState({
    serialNumber: '',
    internalReference: '',
    name: '',
    brand: '',
    model: '',
    status: 'CONFORME',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    observations: '',
    typeId: '',
    siteId: '',
  });


  const [advancedConfig, setAdvancedConfig] = useState({
    recurrenceType: 'FIXED_INTERVAL' as any,
    frequencyValue: 12,
    frequencyUnit: 'MONTHS' as any,
    daysOfWeek: [] as string[],
    dayOfMonth: undefined as number | undefined,
    monthOfYear: undefined as number | undefined,
    dayOfYear: undefined as number | undefined,
    toleranceValue: 0,
    toleranceUnit: 'DAYS' as any,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [sitesData, typesData, methodsData] = await Promise.all([
        siteService.getAll(),
        instrumentTypeService.getAll(),
        calibrationMethodService.getAll(),
      ]);
      setSites(sitesData);
      setTypes(typesData);
      setMethods(methodsData);

      if (id) {
        const instrument = await instrumentService.getById(id);
        setFormData({
          serialNumber: instrument.serialNumber,
          internalReference: instrument.internalReference || '',
          name: instrument.name,
          brand: instrument.brand || '',
          model: instrument.model || '',
          status: instrument.status,
          location: instrument.location || '',
          purchaseDate: instrument.purchaseDate ? instrument.purchaseDate.split('T')[0] : '',
          purchasePrice: instrument.purchasePrice?.toString() || '',
          observations: instrument.observations || '',
          typeId: instrument.type?.id || '',
          siteId: instrument.site?.id || '',
        });
        
        // Charger la configuration d'étalonnage existante
        if (instrument.calibrationMethodId) {
          // Mode méthode prédéfinie
          setCalibrationMode('method');
          const method = methodsData.find((m: any) => m.id === instrument.calibrationMethodId);
          if (method) {
            setSelectedMethod(method);
          }
        } else {
          // Mode personnalisé (advanced)
          setCalibrationMode('advanced');
          setAdvancedConfig({
            recurrenceType: instrument.recurrenceType || 'FIXED_INTERVAL',
            frequencyValue: instrument.calibrationFrequencyValue || 12,
            frequencyUnit: instrument.calibrationFrequencyUnit || 'MONTHS',
            daysOfWeek: instrument.daysOfWeek || [],
            dayOfMonth: instrument.dayOfMonth || undefined,
            monthOfYear: instrument.monthOfYear || undefined,
            dayOfYear: instrument.dayOfYear || undefined,
            toleranceValue: instrument.toleranceValue || 0,
            toleranceUnit: instrument.toleranceUnit || 'DAYS',
          });
        }
      }
    } catch (error) {
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate next calibration date
  };



  const calculateNextCalibrationDate = (frequencyValue: number, frequencyUnit: string) => {
    // Utiliser la date actuelle comme base, pas la date d'achat
    const date = new Date();
    
    switch (frequencyUnit) {
      case 'DAYS':
        date.setDate(date.getDate() + frequencyValue);
        break;
      case 'WEEKS':
        date.setDate(date.getDate() + (frequencyValue * 7));
        break;
      case 'MONTHS':
        date.setMonth(date.getMonth() + frequencyValue);
        break;
      case 'YEARS':
        date.setFullYear(date.getFullYear() + frequencyValue);
        break;
    }
    
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let data: any = {
        ...formData,
        status: formData.status as any,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      };

      // Configuration d'étalonnage selon le mode choisi
      if (calibrationMode === 'method' && selectedMethod) {
        // Utiliser la méthode prédéfinie
        data = {
          ...data,
          calibrationMethodId: selectedMethod.id,
          calibrationFrequencyValue: selectedMethod.frequencyValue,
          calibrationFrequencyUnit: selectedMethod.frequencyUnit,
        };
        
        // Calculer automatiquement la prochaine date d'étalonnage
        if (formData.purchaseDate) {
          data.nextCalibrationDate = calculateNextCalibrationDate(
            selectedMethod.frequencyValue,
            selectedMethod.frequencyUnit
          );
        }
      } else if (calibrationMode === 'advanced') {
        // Configuration avancée
        data = {
          ...data,
          calibrationFrequencyValue: advancedConfig.frequencyValue,
          calibrationFrequencyUnit: advancedConfig.frequencyUnit,
          recurrenceType: advancedConfig.recurrenceType,
          toleranceValue: advancedConfig.toleranceValue,
          toleranceUnit: advancedConfig.toleranceUnit,
          daysOfWeek: advancedConfig.daysOfWeek,
          dayOfMonth: advancedConfig.dayOfMonth,
          monthOfYear: advancedConfig.monthOfYear,
        };
        
        // Calculer automatiquement la prochaine date d'étalonnage
        if (formData.purchaseDate) {
          data.nextCalibrationDate = calculateNextCalibrationDate(
            advancedConfig.frequencyValue,
            advancedConfig.frequencyUnit
          );
        }
      }

      if (isEdit) {
        await instrumentService.update(id!, data);
        showToast('Instrument modifié avec succès', 'success');
      } else {
        await instrumentService.create(data);
        showToast('Instrument créé avec succès', 'success');
      }

      navigate('/instruments');
    } catch (error: any) {
      const { message, details } = extractErrorDetails(error);
      showToast(message, 'error', details);
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
          { label: 'Instruments', href: '/instruments' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'instrument' : 'Nouvel instrument'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isEdit ? 'Modifiez les informations de l\'instrument' : 'Ajoutez un nouvel instrument au parc'}
          </p>
        </div>
        <button
          onClick={() => navigate('/instruments')}
          className="btn-secondary"
        >
          <ArrowLeft className="inline-block w-4 h-4 mr-2" />
          Retour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identification */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Identification</h2>
          </div>

          <FormField
            label="Numéro de série"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            required
            placeholder="PC-2024-001"
          />

          <FormField
            label="Référence interne"
            name="internalReference"
            value={formData.internalReference}
            onChange={handleChange}
            placeholder="INT-001"
          />

          <FormField
            label="Nom de l'instrument"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Pied à coulisse digital 300mm"
          />

          <FormField
            label="Type d'instrument"
            name="typeId"
            type="select"
            value={formData.typeId}
            onChange={handleChange}
            options={types.map((t) => ({ value: t.id, label: t.name }))}
          />

          <FormField
            label="Marque"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Mitutoyo"
          />

          <FormField
            label="Modèle"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="CD-30C"
          />

          {/* Localisation */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
          </div>

          <FormField
            label="Site"
            name="siteId"
            type="select"
            value={formData.siteId}
            onChange={handleChange}
            options={sites.map((s) => ({ value: s.id, label: s.name }))}
          />

          <FormField
            label="Emplacement"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Atelier A"
          />

          <FormField
            label="Statut"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            required
            options={[
              { value: 'CONFORME', label: 'Conforme' },
              { value: 'NON_CONFORME', label: 'Non conforme' },
              { value: 'EN_MAINTENANCE', label: 'En maintenance' },
              { value: 'CASSE', label: 'Cassé' },
            ]}
          />

          {/* Étalonnage */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Étalonnage</h2>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mode de configuration
            </label>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={calibrationMode === 'method'}
                  onChange={() => setCalibrationMode('method')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 font-medium">Méthode prédéfinie</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={calibrationMode === 'advanced'}
                  onChange={() => setCalibrationMode('advanced')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 font-medium">Étalonnage personnalisé</span>
              </label>
            </div>

            {calibrationMode === 'method' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner une méthode d'étalonnage
                  </label>
                  <select
                    value={selectedMethod?.id || ''}
                    onChange={(e) => {
                      const method = methods.find(m => m.id === e.target.value);
                      setSelectedMethod(method);
                    }}
                    className="input"
                    required
                  >
                    <option value="">Choisir une méthode...</option>
                    {methods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                        {method.instrumentType && ` - ${method.instrumentType.name}`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Sélectionnez une méthode d'étalonnage prédéfinie (ex: "Méthode pH-mètre acide")
                  </p>
                </div>

                {selectedMethod && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Détails de la méthode : {selectedMethod.name}
                    </h4>
                    {selectedMethod.description && (
                      <p className="text-sm text-blue-800 mb-3">{selectedMethod.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-blue-900">Fréquence :</span>
                        <span className="ml-2 text-blue-800">
                          {selectedMethod.frequencyValue} {selectedMethod.frequencyUnit?.toLowerCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Tolérance :</span>
                        <span className="ml-2 text-blue-800">
                          {selectedMethod.toleranceValue} {selectedMethod.toleranceUnit?.toLowerCase()}
                        </span>
                      </div>
                      {selectedMethod.estimatedDuration && (
                        <div>
                          <span className="font-medium text-blue-900">Durée estimée :</span>
                          <span className="ml-2 text-blue-800">{selectedMethod.estimatedDuration} min</span>
                        </div>
                      )}
                      {selectedMethod.procedure && (
                        <div className="col-span-2">
                          <span className="font-medium text-blue-900">Procédure :</span>
                          <p className="mt-1 text-blue-800">{selectedMethod.procedure}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}


            {calibrationMode === 'advanced' && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Configuration personnalisée</h3>
                
                {/* Type de récurrence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Type de planification</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAdvancedConfig({...advancedConfig, recurrenceType: 'FIXED_INTERVAL'})}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        advancedConfig.recurrenceType === 'FIXED_INTERVAL'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">Intervalle fixe</div>
                      <div className="text-xs text-gray-500">Ex: tous les 6 mois</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdvancedConfig({...advancedConfig, recurrenceType: 'CALENDAR_WEEKLY'})}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        advancedConfig.recurrenceType === 'CALENDAR_WEEKLY'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">Jour(s) de la semaine</div>
                      <div className="text-xs text-gray-500">Ex: tous les lundis</div>
                    </button>
                  </div>
                </div>

                {/* Configuration spécifique selon le type */}
                {advancedConfig.recurrenceType === 'FIXED_INTERVAL' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Valeur</label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={advancedConfig.frequencyValue || 1}
                        onChange={(e) => setAdvancedConfig({...advancedConfig, frequencyValue: parseInt(e.target.value) || 1})}
                        className="input-field"
                        placeholder="Ex: 6"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Unité</label>
                      <select
                        value={advancedConfig.frequencyUnit || 'MONTHS'}
                        onChange={(e) => setAdvancedConfig({...advancedConfig, frequencyUnit: e.target.value})}
                        className="input-field"
                      >
                        <option value="DAYS">Jour(s)</option>
                        <option value="WEEKS">Semaine(s)</option>
                        <option value="MONTHS">Mois</option>
                        <option value="YEARS">Année(s)</option>
                      </select>
                    </div>
                  </div>
                )}

                {advancedConfig.recurrenceType === 'CALENDAR_WEEKLY' && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Jour(s) de la semaine</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'MONDAY', label: 'Lundi' },
                        { value: 'TUESDAY', label: 'Mardi' },
                        { value: 'WEDNESDAY', label: 'Mercredi' },
                        { value: 'THURSDAY', label: 'Jeudi' },
                        { value: 'FRIDAY', label: 'Vendredi' },
                        { value: 'SATURDAY', label: 'Samedi' },
                        { value: 'SUNDAY', label: 'Dimanche' },
                      ].map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const newDays = advancedConfig.daysOfWeek.includes(day.value)
                              ? advancedConfig.daysOfWeek.filter((d) => d !== day.value)
                              : [...advancedConfig.daysOfWeek, day.value];
                            setAdvancedConfig({...advancedConfig, daysOfWeek: newDays});
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            advancedConfig.daysOfWeek.includes(day.value)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tolérance de retard */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0">⚠️</div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900">Tolérance de retard</h4>
                      <p className="text-xs text-yellow-700 mt-1">
                        Délai supplémentaire acceptable après la date d'étalonnage prévue
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Valeur</label>
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={advancedConfig.toleranceValue}
                        onChange={(e) => setAdvancedConfig({...advancedConfig, toleranceValue: parseInt(e.target.value) || 0})}
                        className="input-field bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Unité</label>
                      <select
                        value={advancedConfig.toleranceUnit}
                        onChange={(e) => setAdvancedConfig({...advancedConfig, toleranceUnit: e.target.value})}
                        className="input-field bg-gray-50"
                      >
                        <option value="DAYS">Jour(s)</option>
                        <option value="WEEKS">Semaine(s)</option>
                        <option value="MONTHS">Mois</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Résumé */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0">ℹ️</div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Résumé de la planification</p>
                      <p className="mt-1">
                        <strong>Fréquence :</strong> {
                          advancedConfig.recurrenceType === 'FIXED_INTERVAL' 
                            ? `Tous les ${advancedConfig.frequencyValue || 1} ${advancedConfig.frequencyUnit?.toLowerCase() || 'mois'}`
                            : advancedConfig.recurrenceType === 'CALENDAR_WEEKLY'
                            ? `Tous les ${advancedConfig.daysOfWeek.map(d => {
                                const days = { MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi', THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche' };
                                return days[d as keyof typeof days];
                              }).join(', ')}`
                            : 'Non configuré'
                        }
                      </p>
                      <p className="mt-1">
                        <strong>Tolérance :</strong> {
                          advancedConfig.toleranceValue === 0 
                            ? 'Aucune tolérance'
                            : `+${advancedConfig.toleranceValue} ${advancedConfig.toleranceUnit?.toLowerCase() || 'jours'}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>


          {/* Achat */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations d'achat</h2>
          </div>

          <FormField
            label="Date d'achat"
            name="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={handleChange}
          />

          <FormField
            label="Prix d'achat (€)"
            name="purchasePrice"
            type="number"
            value={formData.purchasePrice}
            onChange={handleChange}
            step="0.01"
            min="0"
          />

          {/* Observations */}
          <div className="md:col-span-2 mt-4">
            <FormField
              label="Observations"
              name="observations"
              type="textarea"
              value={formData.observations}
              onChange={handleChange}
              rows={4}
              placeholder="Notes ou commentaires supplémentaires..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/instruments')}
            className="btn-secondary"
            disabled={saving}
          >
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer l\'instrument'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstrumentFormPage;


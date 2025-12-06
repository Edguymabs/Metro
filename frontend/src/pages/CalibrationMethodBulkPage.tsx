import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Filter, AlertCircle, CheckCircle, Info } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { extractErrorDetails } from '../utils/errorHandler';
import { calibrationMethodService, CalibrationMethod } from '../services/calibrationMethodService';
import { instrumentService } from '../services/instrumentService';
import { Instrument, Site, InstrumentType } from '../types';

const CalibrationMethodBulkPage: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'select-instruments' | 'select-method' | 'review'>('select-instruments');
  
  // Données
  const [methods, setMethods] = useState<CalibrationMethod[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [types, setTypes] = useState<InstrumentType[]>([]);
  
  // Sélections
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<CalibrationMethod | null>(null);
  const [calendarName, setCalendarName] = useState('');
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // État
  const [applying, setApplying] = useState(false);
  const [conflicts, setConflicts] = useState<Instrument[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (step === 'review' && selectedInstruments.length > 0) {
      checkConflicts();
    }
  }, [step, selectedInstruments]);

  const loadData = async () => {
    try {
      const [methodsData, instrumentsData, sitesData, typesData] = await Promise.all([
        calibrationMethodService.getAll(),
        instrumentService.getAll(),
        fetch('/api/sites').then(r => r.json()).catch(() => []),
        fetch('/api/instrument-types').then(r => r.json()).catch(() => []),
      ]);
      setMethods(methodsData);
      setInstruments(instrumentsData);
      setSites(sitesData || []);
      setTypes(typesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = () => {
    const conflictingInstruments = instruments.filter(inst => 
      selectedInstruments.includes(inst.id) && inst.calibrationMethodId
    );
    setConflicts(conflictingInstruments);
  };

  const filteredInstruments = instruments.filter(inst => {
    if (searchTerm && !inst.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !inst.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterSite && inst.site?.id !== filterSite) return false;
    if (filterType && inst.type?.id !== filterType) return false;
    if (filterStatus && inst.status !== filterStatus) return false;
    return true;
  });

  const handleInstrumentToggle = (instrumentId: string) => {
    setSelectedInstruments(prev => 
      prev.includes(instrumentId) 
        ? prev.filter(id => id !== instrumentId)
        : [...prev, instrumentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInstruments.length === filteredInstruments.length) {
      setSelectedInstruments([]);
    } else {
      setSelectedInstruments(filteredInstruments.map(i => i.id));
    }
  };

  const handleApplyMethod = async () => {
    if (!selectedMethod || selectedInstruments.length === 0) {
      showToast('Veuillez sélectionner une méthode et des instruments', 'error');
      return;
    }

    setApplying(true);

    try {
      const result = await calibrationMethodService.applyMethodToInstruments({
        methodId: selectedMethod.id,
        instrumentIds: selectedInstruments,
        calendarName: calendarName || undefined,
      });

      showToast(result.message, 'success');
      
      // Reset
      setSelectedInstruments([]);
      setSelectedMethod(null);
      setCalendarName('');
      setStep('select-instruments');
      await loadData();
    } catch (error: any) {
      const { message, details } = extractErrorDetails(error);
      showToast(message || 'Erreur lors de l\'application', 'error', details);
    } finally {
      setApplying(false);
    }
  };

  const getSelectedInstrumentsData = () => {
    return instruments.filter(inst => selectedInstruments.includes(inst.id));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link to="/methodes-etalonnage" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Application en Masse d'une Méthode d'Étalonnage
          </h1>
          <p className="mt-1 text-gray-600">
            Sélectionnez d'abord les instruments, puis choisissez la méthode à appliquer
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {[
            { id: 'select-instruments', label: '1. Sélectionner les instruments', icon: Users },
            { id: 'select-method', label: '2. Choisir la méthode', icon: Target },
            { id: 'review', label: '3. Réviser et appliquer', icon: CheckCircle },
          ].map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = 
              (s.id === 'select-instruments' && selectedInstruments.length > 0 && step !== 'select-instruments') ||
              (s.id === 'select-method' && selectedMethod && step === 'review');
            
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-primary-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={isActive ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                    {s.label}
                  </div>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Étape 1 : Sélection des instruments */}
      {step === 'select-instruments' && (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="input"
              >
                <option value="">Tous les sites</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input"
              >
                <option value="">Tous les types</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="">Tous les statuts</option>
                <option value="CONFORME">Conforme</option>
                <option value="NON_CONFORME">Non conforme</option>
                <option value="EN_MAINTENANCE">En maintenance</option>
              </select>
            </div>
          </div>

          {/* Liste des instruments */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Instruments disponibles
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedInstruments.length} instrument(s) sélectionné(s) sur {filteredInstruments.length}
                </p>
              </div>
              <button
                onClick={handleSelectAll}
                className="btn-secondary text-sm"
              >
                {selectedInstruments.length === filteredInstruments.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredInstruments.map((instrument) => (
                <label
                  key={instrument.id}
                  className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedInstruments.includes(instrument.id)}
                    onChange={() => handleInstrumentToggle(instrument.id)}
                    className="mr-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{instrument.name}</div>
                    <div className="text-sm text-gray-500">
                      {instrument.serialNumber} • {instrument.type?.name} • {instrument.site?.name}
                    </div>
                    {instrument.calibrationMethodId && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>Méthode déjà assignée</span>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={() => setStep('select-method')}
              disabled={selectedInstruments.length === 0}
              className="btn-primary"
            >
              Suivant : Choisir la méthode →
            </button>
          </div>
        </div>
      )}

      {/* Étape 2 : Sélection de la méthode */}
      {step === 'select-method' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">
                  {selectedInstruments.length} instrument(s) sélectionné(s)
                </p>
                <p>
                  La méthode que vous allez choisir sera appliquée à tous ces instruments via un calendrier d'étalonnage.
                </p>
              </div>
            </div>
          </div>

          {/* Sélection de la méthode */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Choisir une méthode d'étalonnage
            </h2>
            
            <div className="space-y-3">
              {methods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedMethod?.id === method.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={method.id}
                    checked={selectedMethod?.id === method.id}
                    onChange={() => setSelectedMethod(method)}
                    className="mt-1 mr-4"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{method.description}</div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Type: {method.instrumentType?.name || 'Tous'}</span>
                      <span>•</span>
                      <span>Fréquence: {method.frequencyValue} {method.frequencyUnit?.toLowerCase()}</span>
                      <span>•</span>
                      <span>Tolérance: {method.toleranceValue} {method.toleranceUnit?.toLowerCase()}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Nom du calendrier */}
          {selectedMethod && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Nom du calendrier (optionnel)
              </h2>
              <input
                type="text"
                value={calendarName}
                onChange={(e) => setCalendarName(e.target.value)}
                placeholder={`${selectedMethod.name} - Calendrier automatique`}
                className="input w-full"
              />
              <p className="mt-2 text-sm text-gray-500">
                Un calendrier d'étalonnage sera créé automatiquement pour gérer ces instruments
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep('select-instruments')}
              className="btn-secondary"
            >
              ← Retour
            </button>
            <button
              onClick={() => setStep('review')}
              disabled={!selectedMethod}
              className="btn-primary"
            >
              Suivant : Réviser →
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 : Révision et application */}
      {step === 'review' && selectedMethod && (
        <div className="space-y-6">
          {/* Récapitulatif */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Récapitulatif de l'opération
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">Méthode sélectionnée</div>
                <div className="text-gray-700">{selectedMethod.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Fréquence : {selectedMethod.frequencyValue} {selectedMethod.frequencyUnit?.toLowerCase()}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">Calendrier</div>
                <div className="text-gray-700">
                  {calendarName || `${selectedMethod.name} - Calendrier automatique`}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Un nouveau calendrier sera créé
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">
                  Instruments concernés ({selectedInstruments.length})
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {getSelectedInstrumentsData().map(inst => (
                    <div key={inst.id} className="text-sm text-gray-700">
                      • {inst.name} ({inst.serialNumber})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Avertissement conflits */}
          {conflicts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium mb-1">
                    ⚠️ Attention : {conflicts.length} instrument(s) ont déjà une méthode assignée
                  </p>
                  <p className="mb-2">
                    L'application de cette nouvelle méthode remplacera leur configuration actuelle.
                  </p>
                  <div className="space-y-1">
                    {conflicts.map(inst => (
                      <div key={inst.id}>• {inst.name}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep('select-method')}
              disabled={applying}
              className="btn-secondary"
            >
              ← Retour
            </button>
            <button
              onClick={handleApplyMethod}
              disabled={applying}
              className="btn-primary"
            >
              {applying ? 'Application en cours...' : `Appliquer à ${selectedInstruments.length} instrument(s)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalibrationMethodBulkPage;

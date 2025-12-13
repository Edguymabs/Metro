import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { movementService } from '../services/movementService';
import { instrumentService } from '../services/instrumentService';
import { siteService } from '../services/siteService';
import { Instrument, Site } from '../types';
import FormField from '../components/common/FormField';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Info } from 'lucide-react';

const MovementFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);

  const [formData, setFormData] = useState({
    instrumentId: searchParams.get('instrumentId') || '',
    type: 'ENLEVEMENT',
    fromSiteId: '',
    toSiteId: '',
    externalLocation: '',
    departureDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    actualReturnDate: '',
    deliveryNote: '',
    receptionNote: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.instrumentId) {
      const instrument = instruments.find((i) => i.id === formData.instrumentId);
      setSelectedInstrument(instrument || null);
      
      // Auto-fill fromSiteId with instrument's current site
      if (instrument && instrument.site) {
        setFormData((prev) => ({ ...prev, fromSiteId: instrument.site!.id }));
      }
    }
  }, [formData.instrumentId, instruments]);

  const loadData = async () => {
    try {
      const [instrumentsData, sitesData] = await Promise.all([
        instrumentService.getAll(),
        siteService.getAll(),
      ]);
      setInstruments(instrumentsData.filter((i) => i.status === 'CONFORME'));
      setSites(sitesData);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        type: formData.type as any,
        toSiteId: formData.toSiteId || undefined,
        externalLocation: formData.externalLocation || undefined,
        expectedReturnDate: formData.expectedReturnDate || undefined,
        actualReturnDate: formData.actualReturnDate || undefined,
      };

      await movementService.create(data);
      showToast('Mouvement créé avec succès', 'success');

      if (formData.instrumentId) {
        navigate(`/instruments/${formData.instrumentId}`);
      } else {
        navigate('/mouvements');
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

  const showToSite = formData.type === 'TRANSFERT';
  const showReturnDate = formData.type === 'ENLEVEMENT';
  const showExternalLocation = formData.type === 'ENLEVEMENT';

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Mouvements', href: '/mouvements' },
          { label: 'Nouveau' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau mouvement</h1>
          <p className="mt-1 text-gray-600">
            Enregistrez un enlèvement, retour ou transfert d'instrument
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft className="inline-block w-4 h-4 mr-2" />
          Retour
        </button>
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
              <div className="mt-2 alert-info p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div className="text-sm text-gray-800">
                    <p>
                      <strong>Site actuel:</strong> {selectedInstrument.site?.name || '-'}
                    </p>
                    <p>
                      <strong>Emplacement:</strong> {selectedInstrument.location || '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Type de mouvement */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Type de mouvement</h2>
          </div>

          <div className="md:col-span-2">
            <FormField
              label="Type de mouvement"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleChange}
              required
              options={[
                { value: 'ENLEVEMENT', label: 'Enlèvement (sortie temporaire)' },
                { value: 'RETOUR', label: 'Retour (après enlèvement)' },
                { value: 'TRANSFERT', label: 'Transfert (changement de site permanent)' },
              ]}
            />
          </div>

          <FormField
            label="Raison du mouvement"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Ex: Étalonnage chez prestataire"
          />

          {/* Localisation */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
          </div>

          <FormField
            label="Site de départ"
            name="fromSiteId"
            type="select"
            value={formData.fromSiteId}
            onChange={handleChange}
            options={sites.map((s) => ({ value: s.id, label: s.name }))}
            helperText="Site actuel de l'instrument"
          />

          {showToSite && (
            <FormField
              label="Site d'arrivée"
              name="toSiteId"
              type="select"
              value={formData.toSiteId}
              onChange={handleChange}
              required={showToSite}
              options={sites.map((s) => ({ value: s.id, label: s.name }))}
            />
          )}

          {showExternalLocation && (
            <FormField
              label="Localisation externe"
              name="externalLocation"
              value={formData.externalLocation}
              onChange={handleChange}
              placeholder="Ex: Labo XYZ, Paris"
              helperText="Si l'instrument sort vers un lieu externe"
            />
          )}

          {/* Dates */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dates</h2>
          </div>

          <FormField
            label="Date de départ"
            name="departureDate"
            type="date"
            value={formData.departureDate}
            onChange={handleChange}
            required
          />

          {showReturnDate && (
            <FormField
              label="Date de retour prévue"
              name="expectedReturnDate"
              type="date"
              value={formData.expectedReturnDate}
              onChange={handleChange}
              helperText="Pour les enlèvements temporaires"
            />
          )}

          {formData.type === 'RETOUR' && (
            <FormField
              label="Date de retour réelle"
              name="actualReturnDate"
              type="date"
              value={formData.actualReturnDate}
              onChange={handleChange}
              required={formData.type === 'RETOUR'}
            />
          )}

          {/* Bons */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents de transport</h2>
          </div>

          <FormField
            label="Bon de livraison"
            name="deliveryNote"
            value={formData.deliveryNote}
            onChange={handleChange}
            placeholder="Numéro du bon de livraison"
          />

          {formData.type === 'RETOUR' && (
            <FormField
              label="Bon de réception"
              name="receptionNote"
              value={formData.receptionNote}
              onChange={handleChange}
              placeholder="Numéro du bon de réception"
            />
          )}

          {/* Notes */}
          <div className="md:col-span-2 mt-4">
            <FormField
              label="Notes"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Informations complémentaires..."
            />
          </div>
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
            {saving ? 'Enregistrement...' : 'Créer le mouvement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovementFormPage;


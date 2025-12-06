import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supplierService } from '../services/supplierService';
import FormField from '../components/common/FormField';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Plus, X } from 'lucide-react';

const SupplierFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [accreditationInput, setAccreditationInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    accreditations: [] as string[],
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadSupplier();
    }
  }, [id]);

  const loadSupplier = async () => {
    if (!id) return;

    try {
      const supplier = await supplierService.getById(id);
      setFormData({
        name: supplier.name,
        contactName: supplier.contactName || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        postalCode: supplier.postalCode || '',
        country: supplier.country,
        accreditations: supplier.accreditations || [],
        notes: supplier.notes || '',
      });
    } catch (error) {
      showToast('Erreur lors du chargement du fournisseur', 'error');
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

  const handleAddAccreditation = () => {
    if (accreditationInput.trim() && !formData.accreditations.includes(accreditationInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        accreditations: [...prev.accreditations, accreditationInput.trim()],
      }));
      setAccreditationInput('');
    }
  };

  const handleRemoveAccreditation = (accreditation: string) => {
    setFormData((prev) => ({
      ...prev,
      accreditations: prev.accreditations.filter((a) => a !== accreditation),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEdit) {
        await supplierService.update(id!, formData);
        showToast('Fournisseur modifié avec succès', 'success');
      } else {
        await supplierService.create(formData);
        showToast('Fournisseur créé avec succès', 'success');
      }

      navigate('/fournisseurs');
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
          { label: 'Fournisseurs', href: '/fournisseurs' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isEdit
              ? 'Modifiez les informations du fournisseur'
              : 'Ajoutez un nouveau prestataire métrologique'}
          </p>
        </div>
        <button onClick={() => navigate('/fournisseurs')} className="btn-secondary">
          <ArrowLeft className="inline-block w-4 h-4 mr-2" />
          Retour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations générales */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          </div>

          <div className="md:col-span-2">
            <FormField
              label="Nom du fournisseur"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Métrologie France"
            />
          </div>

          <FormField
            label="Nom du contact"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Pierre Durand"
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contact@metrologie-france.fr"
          />

          <FormField
            label="Téléphone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="01 23 45 67 89"
          />

          {/* Adresse */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
          </div>

          <div className="md:col-span-2">
            <FormField
              label="Adresse"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="10 Rue de l'Industrie"
            />
          </div>

          <FormField
            label="Code postal"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="75010"
          />

          <FormField
            label="Ville"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Paris"
          />

          <div className="md:col-span-2">
            <FormField
              label="Pays"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>

          {/* Accréditations */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Accréditations</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={accreditationInput}
                onChange={(e) => setAccreditationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAccreditation())}
                placeholder="Ex: COFRAC, ISO 17025..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={handleAddAccreditation}
                className="btn-secondary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.accreditations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.accreditations.map((acc) => (
                  <span
                    key={acc}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {acc}
                    <button
                      type="button"
                      onClick={() => handleRemoveAccreditation(acc)}
                      className="hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

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
            onClick={() => navigate('/fournisseurs')}
            className="btn-secondary"
            disabled={saving}
          >
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le fournisseur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierFormPage;


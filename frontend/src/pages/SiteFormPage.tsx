import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { siteService } from '../services/siteService';
import FormField from '../components/common/FormField';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft } from 'lucide-react';

const SiteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    if (id) {
      loadSite();
    }
  }, [id]);

  const loadSite = async () => {
    if (!id) return;

    try {
      const site = await siteService.getById(id);
      setFormData({
        name: site.name,
        code: site.code || '',
        address: site.address || '',
        city: site.city || '',
        postalCode: site.postalCode || '',
        country: site.country,
        contactName: site.contactName || '',
        contactEmail: site.contactEmail || '',
        contactPhone: site.contactPhone || '',
      });
    } catch (error) {
      showToast('Erreur lors du chargement du site', 'error');
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
      if (isEdit) {
        await siteService.update(id!, formData);
        showToast('Site modifié avec succès', 'success');
      } else {
        await siteService.create(formData);
        showToast('Site créé avec succès', 'success');
      }

      navigate('/sites');
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
          { label: 'Sites', href: '/sites' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier le site' : 'Nouveau site'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isEdit
              ? 'Modifiez les informations du site'
              : 'Ajoutez un nouveau site d\'exploitation'}
          </p>
        </div>
        <button onClick={() => navigate('/sites')} className="btn-secondary">
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

          <FormField
            label="Nom du site"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Site de production Paris"
          />

          <FormField
            label="Code du site"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="PAR-01"
            helperText="Code unique d'identification"
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

          {/* Contact sur site */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact sur site</h2>
          </div>

          <FormField
            label="Nom du contact"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Jean Dupont"
          />

          <FormField
            label="Email du contact"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="jean.dupont@entreprise.fr"
          />

          <div className="md:col-span-2">
            <FormField
              label="Téléphone du contact"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="01 23 45 67 89"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/sites')}
            className="btn-secondary"
            disabled={saving}
          >
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le site'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteFormPage;


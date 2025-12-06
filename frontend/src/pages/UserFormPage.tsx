import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import FormField from '../components/common/FormField';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft } from 'lucide-react';

const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'USER',
    isActive: true,
  });

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    if (!id) return;

    try {
      const response = await api.get(`/users/${id}`);
      setFormData({
        email: response.data.email,
        password: '',
        confirmPassword: '',
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        role: response.data.role,
        isActive: response.data.isActive,
      });
    } catch (error) {
      showToast('Erreur lors du chargement de l\'utilisateur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation du mot de passe
    if (!isEdit && !formData.password) {
      showToast('Le mot de passe est requis', 'error');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    setSaving(true);

    try {
      const data: any = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        isActive: formData.isActive,
      };

      // N'inclure le mot de passe que s'il est renseigné
      if (formData.password) {
        data.password = formData.password;
      }

      if (isEdit) {
        await api.patch(`/users/${id}`, data);
        showToast('Utilisateur modifié avec succès', 'success');
      } else {
        await api.post('/users', data);
        showToast('Utilisateur créé avec succès', 'success');
      }

      navigate('/utilisateurs');
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
          { label: 'Utilisateurs', href: '/utilisateurs' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isEdit
              ? 'Modifiez les informations de l\'utilisateur'
              : 'Créez un nouveau compte utilisateur'}
          </p>
        </div>
        <button onClick={() => navigate('/utilisateurs')} className="btn-secondary">
          <ArrowLeft className="inline-block w-4 h-4 mr-2" />
          Retour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations personnelles
            </h2>
          </div>

          <FormField
            label="Prénom"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="Jean"
          />

          <FormField
            label="Nom"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            placeholder="Dupont"
          />

          <div className="md:col-span-2">
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="jean.dupont@entreprise.fr"
            />
          </div>

          {/* Mot de passe */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Mot de passe {isEdit && '(laisser vide pour ne pas changer)'}
            </h2>
          </div>

          <FormField
            label="Mot de passe"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEdit}
            placeholder="••••••••"
            helperText="Minimum 8 caractères"
          />

          <FormField
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!isEdit && !!formData.password}
            placeholder="••••••••"
          />

          {/* Rôle et statut */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Droits d'accès</h2>
          </div>

          <FormField
            label="Rôle"
            name="role"
            type="select"
            value={formData.role}
            onChange={handleChange}
            required
            options={[
              { value: 'USER', label: 'Utilisateur' },
              { value: 'MANAGER', label: 'Gestionnaire' },
              { value: 'ADMIN', label: 'Administrateur' },
            ]}
            helperText="Définit les permissions de l'utilisateur"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
              Compte actif
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/utilisateurs')}
            className="btn-secondary"
            disabled={saving}
          >
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormPage;


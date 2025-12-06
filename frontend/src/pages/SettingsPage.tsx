import React, { useEffect, useState } from 'react';
import { instrumentTypeService } from '../services/instrumentTypeService';
import { InstrumentType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Modal from '../components/common/Modal';
import FormField from '../components/common/FormField';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';

const SettingsPage: React.FC = () => {
  const [types, setTypes] = useState<InstrumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<InstrumentType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const data = await instrumentTypeService.getAll();
      setTypes(data);
    } catch (error) {
      showToast('Erreur lors du chargement des types', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type?: InstrumentType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description || '',
      });
    } else {
      setEditingType(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingType(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingType) {
        await instrumentTypeService.update(editingType.id, formData);
        showToast('Type modifié avec succès', 'success');
      } else {
        await instrumentTypeService.create(formData);
        showToast('Type créé avec succès', 'success');
      }
      loadTypes();
      handleCloseModal();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erreur lors de l\'enregistrement',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await instrumentTypeService.delete(id);
      showToast('Type supprimé avec succès', 'success');
      setTypes(types.filter((t) => t.id !== id));
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Erreur lors de la suppression (des instruments utilisent peut-être ce type)',
        'error'
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Paramètres' }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Paramètres
          </h1>
          <p className="mt-1 text-gray-600">Gérez les paramètres de l'application</p>
        </div>
      </div>

      {/* Types d'instruments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Types d'instruments</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez les catégories d'instruments de votre parc
            </p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus className="inline-block w-4 h-4 mr-2" />
            Nouveau type
          </button>
        </div>

        {types.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun type d'instrument enregistré</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-primary-600 hover:underline"
            >
              Créer le premier type
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((type) => (
              <div
                key={type.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                    {type.description && (
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {type._count?.instruments || 0} instrument(s)
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleOpenModal(type)}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(type.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création/modification */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingType ? 'Modifier le type' : 'Nouveau type d\'instrument'}
        size="sm"
      >
        <form onSubmit={handleSubmit}>
          <FormField
            label="Nom du type"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Pied à coulisse"
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Description optionnelle..."
          />

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editingType ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Supprimer le type"
        message="Êtes-vous sûr de vouloir supprimer ce type d'instrument ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
};

export default SettingsPage;


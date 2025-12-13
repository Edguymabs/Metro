import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, Users, Shield, User } from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { MaintenanceMessageForm, MAINTENANCE_MESSAGE_TYPES, MAINTENANCE_PRIORITIES, TARGET_AUDIENCES } from '../types/maintenance';
import FormField from '../components/common/FormField';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';

const MaintenanceMessageFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<MaintenanceMessageForm>({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    isActive: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '',
    targetAudience: 'all',
    targetRoles: [],
    targetUsers: []
  });

  useEffect(() => {
    if (isEdit) {
      loadMessage();
    }
  }, [id]);

  const loadMessage = async () => {
    try {
      const message = await maintenanceService.getMessageById(id!);
      setFormData({
        title: message.title,
        message: message.message,
        type: message.type,
        priority: message.priority,
        isActive: message.isActive,
        startDate: message.startDate.slice(0, 16),
        endDate: message.endDate ? message.endDate.slice(0, 16) : '',
        targetAudience: message.targetAudience,
        targetRoles: message.targetRoles || [],
        targetUsers: message.targetUsers || []
      });
    } catch (error) {
      showToast('Erreur lors du chargement du message', 'error');
      navigate('/mon-compte/maintenance');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof MaintenanceMessageForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validation basique
      if (!formData.title.trim()) {
        showToast('Le titre est obligatoire', 'error');
        return;
      }
      
      if (!formData.message.trim()) {
        showToast('Le message est obligatoire', 'error');
        return;
      }
      
      if (isEdit) {
        await maintenanceService.updateMessage(id!, formData);
        showToast('Message mis à jour avec succès', 'success');
      } else {
        await maintenanceService.createMessage(formData);
        showToast('Message créé avec succès', 'success');
      }
      
      navigate('/mon-compte/maintenance');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Calendar className="w-5 h-5" />;
      case 'warning':
        return <Clock className="w-5 h-5" />;
      case 'error':
        return <Clock className="w-5 h-5" />;
      case 'success':
        return <Clock className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all':
        return <Users className="w-5 h-5" />;
      case 'admins':
        return <Shield className="w-5 h-5" />;
      case 'users':
        return <User className="w-5 h-5" />;
      case 'specific':
        return <Users className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/' },
          { label: 'Mon compte', href: '/mon-compte' },
          { label: 'Messages de maintenance', href: '/mon-compte/maintenance' },
          { label: isEdit ? 'Modifier' : 'Nouveau message' }
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/mon-compte/maintenance')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Modifier le message' : 'Nouveau message de maintenance'}
            </h1>
            <p className="mt-1 text-gray-600">
              Créez ou modifiez un message de maintenance pour informer les utilisateurs
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
            <div className="space-y-4">
              <FormField
                label="Titre du message"
                name="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                placeholder="Ex: Maintenance programmée"
              />
              
              <FormField
                label="Message"
                name="message"
                type="textarea"
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                required
                rows={4}
                placeholder="Décrivez la maintenance ou l'information à communiquer..."
              />
            </div>
          </div>

          {/* Configuration du message */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Type de message"
                name="type"
                type="select"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                options={Object.entries(MAINTENANCE_MESSAGE_TYPES).map(([value, config]) => ({
                  value,
                  label: config.label
                }))}
              />
              
              <FormField
                label="Priorité"
                name="priority"
                type="select"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                options={Object.entries(MAINTENANCE_PRIORITIES).map(([value, config]) => ({
                  value,
                  label: config.label
                }))}
              />
            </div>
            
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Message actif</span>
              </label>
            </div>
          </div>

          {/* Planification */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Planification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Date de début"
                name="startDate"
                type="text"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
              
              <FormField
                label="Date de fin (optionnelle)"
                name="endDate"
                type="text"
                value={formData.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Le message sera visible entre ces dates. Si aucune date de fin n'est définie, 
              le message restera visible jusqu'à ce qu'il soit désactivé manuellement.
            </p>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Audience cible */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience cible</h3>
            
            <FormField
              label="Qui peut voir ce message ?"
              name="targetAudience"
              type="select"
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              options={Object.entries(TARGET_AUDIENCES).map(([value, config]) => ({
                value,
                label: config.label
              }))}
            />
            
            <p className="mt-2 text-sm text-gray-500">
              {TARGET_AUDIENCES[formData.targetAudience].description}
            </p>

            {/* Configuration spécifique pour audience "specific" */}
            {formData.targetAudience === 'specific' && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôles ciblés
                  </label>
                  <div className="space-y-2">
                    {['ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN'].map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.targetRoles?.includes(role) || false}
                          onChange={(e) => {
                            const current = formData.targetRoles || [];
                            const updated = e.target.checked
                              ? [...current, role]
                              : current.filter(r => r !== role);
                            handleChange('targetRoles', updated);
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Aperçu du message */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h3>
            
            {formData.title && formData.message ? (
              <div className={`${MAINTENANCE_MESSAGE_TYPES[formData.type].bgColor} ${MAINTENANCE_MESSAGE_TYPES[formData.type].borderColor} border rounded-lg p-4`}>
                <div className="flex items-start space-x-3">
                  <div className={`${MAINTENANCE_MESSAGE_TYPES[formData.type].textColor} flex-shrink-0 mt-0.5`}>
                    {getTypeIcon(formData.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className={`${MAINTENANCE_MESSAGE_TYPES[formData.type].textColor} font-semibold text-sm`}>
                        {formData.title}
                      </h4>
                      
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${MAINTENANCE_PRIORITIES[formData.priority].color}20`,
                          color: MAINTENANCE_PRIORITIES[formData.priority].color
                        }}
                      >
                        {MAINTENANCE_PRIORITIES[formData.priority].label}
                      </span>
                    </div>
                    
                    <p className={`${MAINTENANCE_MESSAGE_TYPES[formData.type].textColor} text-sm`}>
                      {formData.message}
                    </p>
                    
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      {getAudienceIcon(formData.targetAudience)}
                      <span className="ml-1">
                        {TARGET_AUDIENCES[formData.targetAudience].label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Remplissez le titre et le message pour voir l'aperçu
              </p>
            )}
          </div>

          {/* Informations utiles */}
          <div className="alert-info p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Conseils</h4>
            <ul className="text-sm text-gray-800 space-y-1">
              <li>• Utilisez des titres clairs et concis</li>
              <li>• Précisez les dates et heures de maintenance</li>
              <li>• Informez sur les impacts pour les utilisateurs</li>
              <li>• Choisissez la priorité selon l'urgence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMessageFormPage;

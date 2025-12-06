import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Copy, Eye, EyeOff, Clock, AlertTriangle, Users, Shield, User, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { maintenanceService } from '../services/maintenanceService';
import { MaintenanceMessage, MAINTENANCE_MESSAGE_TYPES, MAINTENANCE_PRIORITIES, TARGET_AUDIENCES } from '../types/maintenance';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Breadcrumbs from '../components/common/Breadcrumbs';

const MaintenanceMessagesPage: React.FC = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<MaintenanceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [messagesData, statsData] = await Promise.all([
        maintenanceService.getAllMessages(),
        maintenanceService.getMessageStats()
      ]);
      setMessages(messagesData);
      setStats(statsData);
    } catch (error) {
      showToast('Erreur lors du chargement des messages de maintenance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await maintenanceService.deleteMessage(deleteId);
      showToast('Message supprimé avec succès', 'success');
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await maintenanceService.toggleMessageStatus(id, !isActive);
      showToast(`Message ${!isActive ? 'activé' : 'désactivé'} avec succès`, 'success');
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors du changement de statut', 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const message = messages.find(m => m.id === id);
      const newTitle = `${message?.title} (Copie)`;
      await maintenanceService.duplicateMessage(id, newTitle);
      showToast('Message dupliqué avec succès', 'success');
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erreur lors de la duplication', 'error');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <AlertTriangle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all':
        return <Users className="w-4 h-4" />;
      case 'admins':
        return <Shield className="w-4 h-4" />;
      case 'users':
        return <User className="w-4 h-4" />;
      case 'specific':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const isMessageActive = (message: MaintenanceMessage) => {
    if (!message.isActive) return false;
    
    const now = new Date();
    const startDate = new Date(message.startDate);
    const endDate = message.endDate ? new Date(message.endDate) : null;
    
    if (now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
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
          { label: 'Messages de maintenance' }
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages de Maintenance</h1>
          <p className="mt-1 text-gray-600">
            Gérez les notifications de maintenance pour informer les utilisateurs
          </p>
        </div>
        <Link to="/mon-compte/maintenance/nouveau" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau message
        </Link>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Programmés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Expirés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des messages */}
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer un message de maintenance
          </p>
          <div className="mt-6">
            <Link to="/mon-compte/maintenance/nouveau" className="btn-primary">
              Créer un message
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type / Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => {
                  const typeConfig = MAINTENANCE_MESSAGE_TYPES[message.type];
                  const priorityConfig = MAINTENANCE_PRIORITIES[message.priority];
                  const isActive = isMessageActive(message);
                  
                  return (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`${typeConfig.textColor} mr-3`}>
                            {getTypeIcon(message.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {message.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {message.message}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${typeConfig.color}20`,
                              color: typeConfig.color
                            }}
                          >
                            {typeConfig.label}
                          </span>
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${priorityConfig.color}20`,
                              color: priorityConfig.color
                            }}
                          >
                            {getPriorityIcon(message.priority)}
                            <span className="ml-1">{priorityConfig.label}</span>
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getAudienceIcon(message.targetAudience)}
                          <span className="ml-2 text-sm text-gray-900">
                            {TARGET_AUDIENCES[message.targetAudience].label}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Actif
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactif
                            </>
                          )}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <div>Début: {new Date(message.startDate).toLocaleDateString('fr-FR')}</div>
                          {message.endDate && (
                            <div>Fin: {new Date(message.endDate).toLocaleDateString('fr-FR')}</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/mon-compte/maintenance/${message.id}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/mon-compte/maintenance/${message.id}/modifier`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(message.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(message.id, message.isActive)}
                            className={`${
                              message.isActive 
                                ? 'text-gray-400 hover:text-gray-600' 
                                : 'text-green-400 hover:text-green-600'
                            }`}
                          >
                            {message.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setDeleteId(message.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le message"
        message="Êtes-vous sûr de vouloir supprimer ce message de maintenance ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
};

export default MaintenanceMessagesPage;

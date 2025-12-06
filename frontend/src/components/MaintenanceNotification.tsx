import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle, XCircle, Clock, Users, Shield, User } from 'lucide-react';
import { MaintenanceMessage, MAINTENANCE_MESSAGE_TYPES, MAINTENANCE_PRIORITIES } from '../types/maintenance';
import { maintenanceService } from '../services/maintenanceService';
import { useAuth } from '../contexts/AuthContext';

interface MaintenanceNotificationProps {
  onClose?: () => void;
}

const MaintenanceNotification: React.FC<MaintenanceNotificationProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MaintenanceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadActiveMessages();
  }, []);

  const loadActiveMessages = async () => {
    try {
      const activeMessages = await maintenanceService.getActiveMessages();
      
      // Filtrer les messages selon l'audience cible
      const filteredMessages = activeMessages.filter(message => {
        if (!message.isActive) return false;
        
        const now = new Date();
        const startDate = new Date(message.startDate);
        const endDate = message.endDate ? new Date(message.endDate) : null;
        
        // Vérifier les dates
        if (now < startDate) return false;
        if (endDate && now > endDate) return false;
        
        // Vérifier l'audience
        switch (message.targetAudience) {
          case 'all':
            return true;
          case 'admins':
            return user?.role === 'ADMIN';
          case 'users':
            return user?.role !== 'ADMIN';
          case 'specific':
            if (message.targetRoles?.includes(user?.role || '')) return true;
            if (message.targetUsers?.includes(user?.id || '')) return true;
            return false;
          default:
            return false;
        }
      });
      
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (messageId: string) => {
    setDismissedMessages(prev => new Set([...prev, messageId]));
    onClose?.();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
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
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
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

  if (loading) {
    return null;
  }

  const visibleMessages = messages.filter(msg => !dismissedMessages.has(msg.id));

  if (visibleMessages.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {visibleMessages.map((message) => {
        const typeConfig = MAINTENANCE_MESSAGE_TYPES[message.type];
        const priorityConfig = MAINTENANCE_PRIORITIES[message.priority];
        
        return (
          <div
            key={message.id}
            className={`${typeConfig.bgColor} ${typeConfig.borderColor} border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out`}
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`${typeConfig.textColor} flex-shrink-0 mt-0.5`}>
                  {getIcon(message.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className={`${typeConfig.textColor} font-semibold text-sm`}>
                      {message.title}
                    </h4>
                    
                    {/* Badge de priorité */}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}
                      style={{ 
                        backgroundColor: `${priorityConfig.color}20`,
                        color: priorityConfig.color
                      }}
                    >
                      {getPriorityIcon(message.priority)}
                      <span className="ml-1">{priorityConfig.label}</span>
                    </span>
                    
                    {/* Badge d'audience */}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {getAudienceIcon(message.targetAudience)}
                      <span className="ml-1">
                        {message.targetAudience === 'all' ? 'Tous' :
                         message.targetAudience === 'admins' ? 'Admins' :
                         message.targetAudience === 'users' ? 'Utilisateurs' : 'Spécifique'}
                      </span>
                    </span>
                  </div>
                  
                  <p className={`${typeConfig.textColor} text-sm leading-relaxed`}>
                    {message.message}
                  </p>
                  
                  {/* Informations temporelles */}
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>
                      Début: {new Date(message.startDate).toLocaleString('fr-FR')}
                    </span>
                    {message.endDate && (
                      <span>
                        Fin: {new Date(message.endDate).toLocaleString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDismiss(message.id)}
                className={`${typeConfig.textColor} hover:opacity-70 transition-opacity flex-shrink-0 ml-2`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MaintenanceNotification;

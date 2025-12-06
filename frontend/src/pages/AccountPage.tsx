import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { accountService } from '../services/accountService';
import backupService, { Backup } from '../services/backupService';
import { extractErrorDetails } from '../utils/errorHandler';
import { User, Settings, Shield, Bell, BarChart3, AlertTriangle, Lock, Key, Monitor, Database, Download, Upload, Trash, FileText, FileSpreadsheet, HardDrive } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'maintenance' | 'settings' | 'backup'>('profile');
  const [loading, setLoading] = useState(false);
  
  // États pour les préférences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
  });

  // États pour le changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // États pour les sauvegardes
  const [backups, setBackups] = useState<Backup[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('instruments');
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv' | 'json'>('excel');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreFilename, setRestoreFilename] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);

  const baseTabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'maintenance', label: 'Messages de maintenance', icon: AlertTriangle },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const tabs = user?.role === 'ADMIN' 
    ? [...baseTabs, { id: 'backup', label: 'Sauvegardes', icon: Database }]
    : baseTabs;

  // Charger les préférences au montage
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await accountService.getPreferences();
      setPreferences(prefs);
    } catch (error: any) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  };

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean) => {
    const oldPrefs = { ...preferences };
    
    // Mise à jour optimiste
    setPreferences({ ...preferences, [key]: value });

    try {
      await accountService.updatePreferences({ [key]: value });
      showToast('Préférence mise à jour', 'success');
    } catch (error: any) {
      // Rollback en cas d'erreur
      setPreferences(oldPrefs);
      const { message, details } = extractErrorDetails(error);
      showToast(message, 'error', details);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast('Le mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      showToast('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre', 'error');
      return;
    }

    setPasswordLoading(true);

    try {
      await accountService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      showToast('Mot de passe modifié avec succès', 'success');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      const { message, details } = extractErrorDetails(error);
      showToast(message || 'Erreur lors du changement de mot de passe', 'error', details);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Fonctions de gestion des sauvegardes
  const loadBackups = async () => {
    setBackupsLoading(true);
    try {
      const data = await backupService.listBackups();
      setBackups(data.backups);
    } catch (error: any) {
      const { message } = extractErrorDetails(error);
      showToast(message, 'error');
    } finally {
      setBackupsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const result = await backupService.createBackup();
      showToast(result.message, 'success');
      await loadBackups();
    } catch (error: any) {
      const { message } = extractErrorDetails(error);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportEntity = async () => {
    setLoading(true);
    try {
      const result = await backupService.exportEntity(selectedEntity, selectedFormat);
      showToast(`Export ${selectedFormat} créé: ${result.filename}`, 'success');
      await loadBackups();
    } catch (error: any) {
      const { message } = extractErrorDetails(error);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async (format: 'excel' | 'csv' | 'json') => {
    setLoading(true);
    try {
      const result = await backupService.exportAll(format);
      showToast(`Export complet créé: ${result.filename}`, 'success');
      await loadBackups();
    } catch (error: any) {
      const { message } = extractErrorDetails(error);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFilename) return;
    setLoading(true);
    try {
      await backupService.restoreBackup(restoreFilename);
      showToast('Backup restauré avec succès', 'success');
      setShowRestoreModal(false);
      setRestoreFilename('');
    } catch (error: any) {
      const { message } = extractErrorDetails(error);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    if (!importFile) return;
    setLoading(true);
    try {
      const result = await backupService.importData(selectedEntity, importFile);
      showToast(`Import réussi: ${result.imported} entrées importées`, 'success');
      if (result.errors && result.errors.length > 0) {
        console.warn('Erreurs d\'import:', result.errors);
      }
      setImportFile(null);
    } catch (error: any) {
      const { message } = extractErrorDetails(error);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      await backupService.downloadBackup(filename);
      showToast('Téléchargement démarré', 'success');
    } catch (error: any) {
      const { message } = extractErrorDetails(error);
      showToast(message, 'error');
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    try {
      await backupService.deleteBackup(filename);
      showToast('Backup supprimé', 'success');
      await loadBackups();
    } catch (error: any) {
      const { message } = extractErrorDetails(error);
      showToast(message, 'error');
    }
  };

  // Charger les backups quand l'onglet backup est activé
  useEffect(() => {
    if (activeTab === 'backup' && user?.role === 'ADMIN') {
      loadBackups();
    }
  }, [activeTab, user?.role]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/' },
          { label: 'Mon compte' }
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon compte</h1>
          <p className="mt-1 text-gray-600">
            Gérez votre profil et les paramètres de l'application
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="mt-2 flex items-center">
                    <Shield className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">
                      {user?.role === 'ADMIN' ? 'Administrateur' :
                       user?.role === 'RESPONSABLE_METROLOGIE' ? 'Responsable métrologie' :
                       user?.role === 'TECHNICIEN' ? 'Technicien' : user?.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Informations personnelles</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Prénom</dt>
                      <dd className="text-sm text-gray-900">{user?.firstName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Nom</dt>
                      <dd className="text-sm text-gray-900">{user?.lastName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{user?.email}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Rôle et permissions</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Rôle</dt>
                      <dd className="text-sm text-gray-900">
                        {user?.role === 'ADMIN' ? 'Administrateur' :
                         user?.role === 'RESPONSABLE_METROLOGIE' ? 'Responsable métrologie' :
                         user?.role === 'TECHNICIEN' ? 'Technicien' : user?.role}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Accès</dt>
                      <dd className="text-sm text-gray-900">
                        {user?.role === 'ADMIN' ? 'Accès complet' :
                         user?.role === 'RESPONSABLE_METROLOGIE' ? 'Gestion métrologie' :
                         user?.role === 'TECHNICIEN' ? 'Opérations techniques' : 'Accès limité'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Messages de maintenance */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Messages de maintenance</h2>
                  <p className="text-gray-600">
                    Gérez les notifications de maintenance pour informer les utilisateurs
                  </p>
                </div>
                <Link to="/mon-compte/maintenance" className="btn-primary flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Gérer les messages
                </Link>
              </div>

              {user?.role === 'ADMIN' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Bell className="w-8 h-8 text-blue-600" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-900">Notifications</h3>
                        <p className="text-sm text-blue-700">Créez des messages pour informer les utilisateurs</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-900">Maintenance</h3>
                        <p className="text-sm text-yellow-700">Annoncez les périodes de maintenance</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <BarChart3 className="w-8 h-8 text-green-600" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-900">Statistiques</h3>
                        <p className="text-sm text-green-700">Suivez l'impact de vos messages</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Accès restreint</h3>
                  <p className="text-gray-600">
                    Seuls les administrateurs peuvent gérer les messages de maintenance.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Onglet Paramètres */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Paramètres du compte</h2>
                <p className="text-gray-600">
                  Configurez vos préférences et paramètres de sécurité
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sécurité */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Sécurité
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-3 border border-transparent hover:border-gray-200"
                    >
                      <Key className="w-4 h-4 text-gray-400" />
                      <span>Changer le mot de passe</span>
                    </button>
                    <button
                      onClick={() => showToast('Fonctionnalité à venir', 'info')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-3 border border-transparent hover:border-gray-200"
                    >
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span>Authentification à deux facteurs</span>
                      <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Bientôt</span>
                    </button>
                    <button
                      onClick={() => showToast('Fonctionnalité à venir', 'info')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-3 border border-transparent hover:border-gray-200"
                    >
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <span>Sessions actives</span>
                      <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Bientôt</span>
                    </button>
                  </div>
                </div>

                {/* Préférences */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Préférences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">Notifications par email</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">Notifications push</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.pushNotifications}
                        onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">Mode sombre</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.darkMode}
                        onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Sauvegardes (Admin uniquement) */}
          {activeTab === 'backup' && user?.role === 'ADMIN' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gestion des sauvegardes</h2>
                <p className="text-gray-600">
                  Créez, exportez et restaurez vos données en toute sécurité
                </p>
              </div>

              {/* Zone Exports */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  Exports de données
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Backup SQL Complet */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <HardDrive className="w-8 h-8 text-gray-600 mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Backup SQL Complet</h4>
                    <p className="text-sm text-gray-600 mb-4">Dump PostgreSQL de toute la base</p>
                    <button
                      onClick={handleCreateBackup}
                      disabled={loading}
                      className="btn-primary w-full"
                    >
                      {loading ? 'Création...' : 'Créer backup'}
                    </button>
                  </div>

                  {/* Export Sélectif */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <FileText className="w-8 h-8 text-gray-600 mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Export Sélectif</h4>
                    <div className="space-y-2 mb-4">
                      <select
                        value={selectedEntity}
                        onChange={(e) => setSelectedEntity(e.target.value)}
                        className="input text-sm"
                      >
                        <option value="instruments">Instruments</option>
                        <option value="interventions">Interventions</option>
                        <option value="sites">Sites</option>
                        <option value="suppliers">Fournisseurs</option>
                        <option value="users">Utilisateurs</option>
                        <option value="movements">Mouvements</option>
                        <option value="instrumentTypes">Types d'instruments</option>
                      </select>
                      <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as any)}
                        className="input text-sm"
                      >
                        <option value="excel">Excel (.xlsx)</option>
                        <option value="csv">CSV (.csv)</option>
                        <option value="json">JSON (.json)</option>
                      </select>
                    </div>
                    <button
                      onClick={handleExportEntity}
                      disabled={loading}
                      className="btn-primary w-full"
                    >
                      {loading ? 'Export...' : 'Exporter'}
                    </button>
                  </div>

                  {/* Export Complet */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <FileSpreadsheet className="w-8 h-8 text-gray-600 mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Export Complet</h4>
                    <p className="text-sm text-gray-600 mb-4">Toutes les entités</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleExportAll('excel')}
                        disabled={loading}
                        className="btn-secondary w-full text-sm"
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => handleExportAll('csv')}
                        disabled={loading}
                        className="btn-secondary w-full text-sm"
                      >
                        CSV (zip)
                      </button>
                      <button
                        onClick={() => handleExportAll('json')}
                        disabled={loading}
                        className="btn-secondary w-full text-sm"
                      >
                        JSON (zip)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone Import/Restauration */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-yellow-600" />
                  Import et restauration
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Attention</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Import de données */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Importer des données</h4>
                    <p className="text-sm text-gray-600 mb-4">CSV, JSON ou Excel</p>
                    <div className="space-y-2">
                      <select
                        value={selectedEntity}
                        onChange={(e) => setSelectedEntity(e.target.value)}
                        className="input text-sm"
                      >
                        <option value="instruments">Instruments</option>
                        <option value="interventions">Interventions</option>
                        <option value="sites">Sites</option>
                        <option value="suppliers">Fournisseurs</option>
                        <option value="instrumentTypes">Types d'instruments</option>
                      </select>
                      <input
                        type="file"
                        accept=".csv,.json,.xlsx,.xls"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      <button
                        onClick={handleImportData}
                        disabled={!importFile || loading}
                        className="btn-primary w-full"
                      >
                        {loading ? 'Import...' : 'Importer'}
                      </button>
                    </div>
                  </div>

                  {/* Restauration SQL */}
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Restaurer Backup SQL
                    </h4>
                    <p className="text-sm text-red-600 mb-4">
                      ⚠️ Attention: remplace toutes les données!
                    </p>
                    <button
                      onClick={() => setShowRestoreModal(true)}
                      disabled={backups.length === 0}
                      className="btn-danger w-full"
                    >
                      Restaurer un backup
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des backups */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Backups disponibles ({backups.length})
                  </h3>
                  <button
                    onClick={loadBackups}
                    disabled={backupsLoading}
                    className="btn-secondary text-sm"
                  >
                    {backupsLoading ? 'Chargement...' : 'Actualiser'}
                  </button>
                </div>

                {backupsLoading ? (
                  <LoadingSpinner />
                ) : backups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun backup disponible</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {backups.map((backup) => (
                      <div
                        key={backup.filename}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{backup.filename}</div>
                          <div className="text-sm text-gray-500">
                            {backupService.formatFileSize(backup.size)} • {backupService.formatDate(backup.created)} • {backup.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadBackup(backup.filename)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer ${backup.filename}?`)) {
                                handleDeleteBackup(backup.filename);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de restauration */}
      {showRestoreModal && (
        <Modal
          isOpen={showRestoreModal}
          onClose={() => setShowRestoreModal(false)}
          title="Restaurer un backup SQL"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 mb-1">Attention: Opération destructive</h4>
                  <p className="text-sm text-red-700">
                    Cette action remplacera TOUTES les données actuelles par celles du backup.
                    Cette opération est irréversible.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un backup à restaurer
              </label>
              <select
                value={restoreFilename}
                onChange={(e) => setRestoreFilename(e.target.value)}
                className="input"
              >
                <option value="">-- Choisir un backup --</option>
                {backups
                  .filter(b => b.filename.endsWith('.sql') || b.filename.includes('backup'))
                  .map(backup => (
                    <option key={backup.filename} value={backup.filename}>
                      {backup.filename} ({backupService.formatDate(backup.created)})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setRestoreFilename('');
                }}
                className="btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={!restoreFilename || loading}
                className="btn-danger"
              >
                {loading ? 'Restauration...' : 'Confirmer la restauration'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <form onSubmit={handlePasswordChange}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h3>
                    <p className="text-sm text-gray-600">Saisissez votre mot de passe actuel et le nouveau</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="input"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="input"
                      required
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 8 caractères avec majuscule, minuscule et chiffre
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="btn-secondary"
                  disabled={passwordLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;

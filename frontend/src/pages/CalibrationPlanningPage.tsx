import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, List, BarChart3, Plus, Download, Clock, AlertTriangle, CheckCircle, Grid3x3, ArrowLeft, FileText } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Calendar from '../components/Calendar';
import { useToast } from '../contexts/ToastContext';
import { instrumentService } from '../services/instrumentService';

interface CalibrationItem {
  id: string;
  instrumentId: string;
  instrumentName: string;
  serialNumber: string;
  type?: string;
  typeId?: string;
  site?: string;
  nextCalibrationDate: string;
  toleranceExpiryDate?: string;
  status: 'ON_TIME' | 'OVERDUE_TOLERATED' | 'OVERDUE_CRITICAL' | 'NOT_SET';
  daysUntil: number;
}

interface InstrumentTypeCard {
  id: string;
  name: string;
  total: number;
  onTime: number;
  tolerated: number;
  critical: number;
  thisWeek: number;
}

type ViewMode = 'cards' | 'list' | 'stats' | 'calendar';

const CalibrationPlanningPage: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [calibrations, setCalibrations] = useState<CalibrationItem[]>([]);
  const [filteredCalibrations, setFilteredCalibrations] = useState<CalibrationItem[]>([]);
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentTypeCard[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    site: 'all',
  });

  useEffect(() => {
    loadCalibrations();
  }, []);

  useEffect(() => {
    // Gérer les filtres depuis l'URL
    const urlFilter = searchParams.get('filter');
    if (urlFilter) {
      setViewMode('list');
      if (urlFilter === 'overdue') {
        // Afficher uniquement les instruments en retard
        setFilters({ status: 'all', search: '', site: 'all' });
      } else if (urlFilter === 'upcoming') {
        // Afficher uniquement les instruments à venir dans 30 jours
        setFilters({ status: 'all', search: '', site: 'all' });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [calibrations, filters, selectedType]);

  const loadCalibrations = async () => {
    try {
      const instruments = await instrumentService.getAll();
      
      const items: CalibrationItem[] = instruments
        .map(i => {
          // Calculer la date d'étalonnage si elle n'existe pas
          let nextCalibrationDate: string;
          if (i.nextCalibrationDate) {
            nextCalibrationDate = i.nextCalibrationDate;
          } else {
            // Calculer la prochaine date basée sur la fréquence
            const now = new Date();
            const frequency = i.calibrationFrequencyValue || 12;
            const unit = i.calibrationFrequencyUnit || 'MONTHS';
            
            switch (unit) {
              case 'DAYS':
                now.setDate(now.getDate() + frequency);
                break;
              case 'WEEKS':
                now.setDate(now.getDate() + (frequency * 7));
                break;
              case 'MONTHS':
                now.setMonth(now.getMonth() + frequency);
                break;
              case 'YEARS':
                now.setFullYear(now.getFullYear() + frequency);
                break;
            }
            nextCalibrationDate = now.toISOString();
          }

          const nextDate = new Date(nextCalibrationDate);
          const now = new Date();
          const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          let status: CalibrationItem['status'] = 'ON_TIME';
          if (daysUntil < 0) {
            if (i.toleranceExpiryDate) {
              const toleranceDate = new Date(i.toleranceExpiryDate);
              status = now <= toleranceDate ? 'OVERDUE_TOLERATED' : 'OVERDUE_CRITICAL';
            } else {
              status = 'OVERDUE_CRITICAL';
            }
          }

          return {
            id: i.id,
            instrumentId: i.id,
            instrumentName: i.name,
            serialNumber: i.serialNumber,
            type: i.type?.name,
            typeId: i.type?.id,
            site: i.site?.name,
            nextCalibrationDate,
            toleranceExpiryDate: i.toleranceExpiryDate,
            status,
            daysUntil,
          };
        })
        .sort((a, b) => a.daysUntil - b.daysUntil);

      setCalibrations(items);

      // Grouper par type d'instrument
      const typeMap = new Map<string, InstrumentTypeCard>();
      
      items.forEach(item => {
        const typeName = item.type || 'Non classé';
        const typeId = item.typeId || 'unclassified';
        
        if (!typeMap.has(typeId)) {
          typeMap.set(typeId, {
            id: typeId,
            name: typeName,
            total: 0,
            onTime: 0,
            tolerated: 0,
            critical: 0,
            thisWeek: 0,
          });
        }

        const card = typeMap.get(typeId)!;
        card.total++;
        
        if (item.status === 'ON_TIME') card.onTime++;
        if (item.status === 'OVERDUE_TOLERATED') card.tolerated++;
        if (item.status === 'OVERDUE_CRITICAL') card.critical++;
        if (item.daysUntil >= 0 && item.daysUntil <= 7) card.thisWeek++;
      });

      setInstrumentTypes(Array.from(typeMap.values()).sort((a, b) => b.total - a.total));
    } catch (error) {
      showToast('Erreur lors du chargement des étalonnages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...calibrations];

    // Filtre depuis l'URL (Dashboard)
    const urlFilter = searchParams.get('filter');
    if (urlFilter === 'overdue') {
      // Afficher uniquement les instruments en retard (retard critique ou toléré)
      filtered = filtered.filter(c => c.daysUntil < 0);
    } else if (urlFilter === 'upcoming') {
      // Afficher uniquement les instruments à venir dans les 30 prochains jours
      filtered = filtered.filter(c => c.daysUntil >= 0 && c.daysUntil <= 30);
    }

    // Filtre par type sélectionné
    if (selectedType) {
      filtered = filtered.filter(c => (c.typeId || 'unclassified') === selectedType);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.instrumentName.toLowerCase().includes(search) ||
          c.serialNumber.toLowerCase().includes(search)
      );
    }

    if (filters.site !== 'all') {
      filtered = filtered.filter(c => c.site === filters.site);
    }

    setFilteredCalibrations(filtered);
  };

  const handleTypeClick = (typeId: string) => {
    setSelectedType(typeId);
    setViewMode('list');
  };

  const handleBackToCards = () => {
    setSelectedType(null);
    setViewMode('cards');
    setFilters({ status: 'all', search: '', site: 'all' });
    // Nettoyer les paramètres d'URL
    window.history.replaceState({}, '', '/etalonnages');
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Réinitialiser les filtres de statut et site quand on passe en mode cards ou stats
    if (mode === 'cards' || mode === 'stats') {
      setFilters({ ...filters, status: 'all', site: 'all' });
    }
  };

  // Convertir les étalonnages en événements de calendrier
  const getCalendarEvents = () => {
    return filteredCalibrations.map((cal) => {
      const startDate = new Date(cal.nextCalibrationDate);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1); // Durée d'1 heure par défaut

      return {
        id: cal.id,
        title: `${cal.instrumentName} (${cal.serialNumber})`,
        start: startDate,
        end: endDate,
        resource: {
          instrumentId: cal.instrumentId,
          instrumentName: cal.instrumentName,
          serialNumber: cal.serialNumber,
          site: cal.site,
          status: cal.status,
          daysUntil: cal.daysUntil
        }
      };
    });
  };

  const handleCalendarEventClick = (event: any) => {
    // Rediriger vers la page de l'instrument
    window.location.href = `/instruments/${event.resource.instrumentId}`;
  };

  const getStatusColor = (status: CalibrationItem['status']) => {
    switch (status) {
      case 'ON_TIME':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE_TOLERATED':
        return 'bg-orange-100 text-orange-800';
      case 'OVERDUE_CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: CalibrationItem['status']) => {
    switch (status) {
      case 'ON_TIME':
        return 'À jour';
      case 'OVERDUE_TOLERATED':
        return 'Retard toléré';
      case 'OVERDUE_CRITICAL':
        return 'Retard critique';
      default:
        return 'Non configuré';
    }
  };

  const getStatusIcon = (status: CalibrationItem['status']) => {
    switch (status) {
      case 'ON_TIME':
        return <CheckCircle className="w-4 h-4" />;
      case 'OVERDUE_TOLERATED':
        return <Clock className="w-4 h-4" />;
      case 'OVERDUE_CRITICAL':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const stats = {
    total: calibrations.length,
    onTime: calibrations.filter(c => c.status === 'ON_TIME').length,
    tolerated: calibrations.filter(c => c.status === 'OVERDUE_TOLERATED').length,
    critical: calibrations.filter(c => c.status === 'OVERDUE_CRITICAL').length,
    thisWeek: calibrations.filter(c => c.daysUntil >= 0 && c.daysUntil <= 7).length,
    thisMonth: calibrations.filter(c => c.daysUntil >= 0 && c.daysUntil <= 30).length,
  };

  const sites = [...new Set(calibrations.map(c => c.site).filter(Boolean))];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {(selectedType || searchParams.get('filter')) && (
            <button
              onClick={handleBackToCards}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchParams.get('filter') === 'overdue'
                ? 'Instruments en Retard'
                : searchParams.get('filter') === 'upcoming'
                ? 'Étalonnages à Venir (30 jours)'
                : selectedType
                ? instrumentTypes.find(t => t.id === selectedType)?.name || 'Étalonnages'
                : 'Planning des Étalonnages'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {selectedType || searchParams.get('filter')
                ? `${filteredCalibrations.length} instrument(s) à étalonner`
                : 'Gérez et planifiez tous vos étalonnages'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter
          </button>
          <Link to="/interventions/nouvelle" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Effectuer un étalonnage
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div 
          className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          onClick={() => navigate('/instruments')}
        >
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div 
          className="bg-green-50 rounded-lg shadow p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          onClick={() => {
            setViewMode('list');
            setFilters({ ...filters, status: 'ON_TIME' });
          }}
        >
          <div className="text-sm text-green-600">À jour</div>
          <div className="text-2xl font-bold text-green-700">{stats.onTime}</div>
        </div>
        <div 
          className="bg-orange-50 rounded-lg shadow p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          onClick={() => {
            setViewMode('list');
            setFilters({ ...filters, status: 'OVERDUE_TOLERATED' });
          }}
        >
          <div className="text-sm text-orange-600">Retard toléré</div>
          <div className="text-2xl font-bold text-orange-700">{stats.tolerated}</div>
        </div>
        <div 
          className="bg-red-50 rounded-lg shadow p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          onClick={() => {
            setViewMode('list');
            setFilters({ ...filters, status: 'OVERDUE_CRITICAL' });
          }}
        >
          <div className="text-sm text-red-600">Retard critique</div>
          <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
        </div>
        <div 
          className="bg-blue-50 rounded-lg shadow p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          onClick={() => {
            setViewMode('list');
            // Filtrer pour cette semaine (0-7 jours)
            const thisWeekCalibrations = calibrations.filter(c => c.daysUntil >= 0 && c.daysUntil <= 7);
            setFilteredCalibrations(thisWeekCalibrations);
          }}
        >
          <div className="text-sm text-blue-600">Cette semaine</div>
          <div className="text-2xl font-bold text-blue-700">{stats.thisWeek}</div>
        </div>
        <div 
          className="bg-purple-50 rounded-lg shadow p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          onClick={() => {
            setViewMode('list');
            // Filtrer pour ce mois (0-30 jours)
            const thisMonthCalibrations = calibrations.filter(c => c.daysUntil >= 0 && c.daysUntil <= 30);
            setFilteredCalibrations(thisMonthCalibrations);
          }}
        >
          <div className="text-sm text-purple-600">Ce mois</div>
          <div className="text-2xl font-bold text-purple-700">{stats.thisMonth}</div>
        </div>
      </div>

      {/* Barre d'outils */}
      {!selectedType && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Modes de vue */}
            <div className="flex gap-2">
              <button
                onClick={() => handleViewModeChange('cards')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  viewMode === 'cards'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Cartes
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                Liste
              </button>
              <button
                onClick={() => handleViewModeChange('stats')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  viewMode === 'stats'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Statistiques
              </button>
              <button
                onClick={() => handleViewModeChange('calendar')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Calendrier
              </button>
            </div>

            {/* Filtres */}
            <div className="flex-1 flex gap-3">
              <input
                type="text"
                placeholder="Rechercher un instrument..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input flex-1"
              />
              {/* Filtres de statut et site uniquement en mode liste */}
              {(viewMode === 'list' || viewMode === 'calendar') && (
                <>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="input w-48"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="ON_TIME">À jour</option>
                    <option value="OVERDUE_TOLERATED">Retard toléré</option>
                    <option value="OVERDUE_CRITICAL">Retard critique</option>
                  </select>
                  <select
                    value={filters.site}
                    onChange={(e) => setFilters({ ...filters, site: e.target.value })}
                    className="input w-48"
                  >
                    <option value="all">Tous les sites</option>
                    {sites.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filtres pour la vue liste avec type sélectionné */}
      {selectedType && (viewMode === 'list' || viewMode === 'calendar') && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Rechercher un instrument..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input flex-1"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input w-48"
            >
              <option value="all">Tous les statuts</option>
              <option value="ON_TIME">À jour</option>
              <option value="OVERDUE_TOLERATED">Retard toléré</option>
              <option value="OVERDUE_CRITICAL">Retard critique</option>
            </select>
            <select
              value={filters.site}
              onChange={(e) => setFilters({ ...filters, site: e.target.value })}
              className="input w-48"
            >
              <option value="all">Tous les sites</option>
              {sites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Contenu selon le mode */}
      {viewMode === 'cards' && !selectedType && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {instrumentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeClick(type.id)}
              className="bg-white rounded-lg shadow hover:shadow-xl transition-all p-6 text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {type.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {type.total} instrument{type.total > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
              </div>

              <div className="space-y-3">
                {/* Statuts */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">À jour</span>
                  <span className="font-semibold text-green-600">{type.onTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Retard toléré</span>
                  <span className="font-semibold text-orange-600">{type.tolerated}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Retard critique</span>
                  <span className="font-semibold text-red-600">{type.critical}</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cette semaine</span>
                    <span className="font-semibold text-blue-600">{type.thisWeek}</span>
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full flex">
                    {type.onTime > 0 && (
                      <div
                        className="bg-green-500"
                        style={{ width: `${(type.onTime / type.total) * 100}%` }}
                      />
                    )}
                    {type.tolerated > 0 && (
                      <div
                        className="bg-orange-500"
                        style={{ width: `${(type.tolerated / type.total) * 100}%` }}
                      />
                    )}
                    {type.critical > 0 && (
                      <div
                        className="bg-red-500"
                        style={{ width: `${(type.critical / type.total) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-primary-600 group-hover:text-primary-700 font-medium">
                Voir les instruments →
              </div>
            </button>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instrument
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prochaine date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dans
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalibrations.map((cal) => (
                <tr 
                  key={cal.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => navigate(`/instruments/${cal.instrumentId}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cal.instrumentName}</div>
                      <div className="text-sm text-gray-500">{cal.serialNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cal.type || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cal.site || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(cal.nextCalibrationDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        cal.daysUntil < 0
                          ? 'text-red-600'
                          : cal.daysUntil <= 7
                          ? 'text-orange-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {cal.daysUntil < 0
                        ? `${Math.abs(cal.daysUntil)} jours de retard`
                        : cal.daysUntil === 0
                        ? "Aujourd'hui"
                        : cal.daysUntil === 1
                        ? 'Demain'
                        : `${cal.daysUntil} jours`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        cal.status
                      )}`}
                    >
                      {getStatusIcon(cal.status)}
                      {getStatusLabel(cal.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/instruments/${cal.instrumentId}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Voir
                    </Link>
                    <Link
                      to={`/interventions/nouvelle?instrumentId=${cal.instrumentId}`}
                      className="text-primary-600 hover:text-primary-900"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Effectuer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCalibrations.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun étalonnage</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucun étalonnage ne correspond à vos filtres
              </p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Calendrier des Étalonnages
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Visualisez les étalonnages à venir dans le calendrier. Cliquez sur un événement pour voir les détails de l'instrument.
            </p>
            <Calendar
              events={getCalendarEvents()}
              onEventClick={handleCalendarEventClick}
              height={700}
            />
          </div>
        </div>
      )}

      {viewMode === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Répartition par Statut
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-700">À jour</span>
                  <span className="font-medium">{stats.onTime} ({Math.round((stats.onTime / stats.total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.onTime / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-orange-700">Retard toléré</span>
                  <span className="font-medium">{stats.tolerated} ({Math.round((stats.tolerated / stats.total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(stats.tolerated / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-700">Retard critique</span>
                  <span className="font-medium">{stats.critical} ({Math.round((stats.critical / stats.total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(stats.critical / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Étalonnages à Venir
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-blue-600">Cette semaine</div>
                  <div className="text-2xl font-bold text-blue-700">{stats.thisWeek}</div>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="text-sm text-purple-600">Ce mois</div>
                  <div className="text-2xl font-bold text-purple-700">{stats.thisMonth}</div>
                </div>
                <CalendarIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liens rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/methodes-etalonnage"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Méthodes d'Étalonnage</h3>
              <p className="text-sm text-gray-500">Gérer les templates</p>
            </div>
          </div>
        </Link>

        <Link
          to="/calendriers-etalonnage"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Calendriers</h3>
              <p className="text-sm text-gray-500">Planifications multiples</p>
            </div>
          </div>
        </Link>

        <Link
          to="/interventions"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <List className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Interventions</h3>
              <p className="text-sm text-gray-500">Historique complet</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CalibrationPlanningPage;


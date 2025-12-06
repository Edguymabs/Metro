import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { interventionService } from '../services/interventionService';
import { Intervention } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatCurrency } from '../utils/format';
import { Plus, Filter, ArrowLeft } from 'lucide-react';

const InterventionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [filteredInterventions, setFilteredInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadInterventions();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    applyFilters();
  }, [interventions, searchParams]);

  const loadInterventions = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      
      const data = await interventionService.getAll(params);
      setInterventions(data);
      setFilteredInterventions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des interventions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...interventions];

    // Filtre depuis l'URL (Dashboard)
    const urlFilter = searchParams.get('filter');
    if (urlFilter === 'nonconform') {
      // Afficher uniquement les interventions non-conformes
      filtered = filtered.filter(i => i.conformityResult === 'NON_CONFORME');
    }

    setFilteredInterventions(filtered);
  };

  const handleBackToDashboard = () => {
    // Utiliser la navigation React Router au lieu de reload
    window.history.replaceState({}, '', '/interventions');
    setStatusFilter('');
    setTypeFilter('');
    setFilteredInterventions(interventions);
  };

  const urlFilter = searchParams.get('filter');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {urlFilter && (
            <button
              onClick={handleBackToDashboard}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {urlFilter === 'nonconform' ? 'Interventions Non-Conformes' : 'Interventions'}
            </h1>
            <p className="mt-1 text-gray-600">
              {urlFilter === 'nonconform'
                ? `${filteredInterventions.length} intervention(s) non-conforme(s)`
                : 'Suivi des étalonnages et interventions'}
            </p>
          </div>
        </div>
        <Link to="/interventions/nouvelle" className="btn-primary">
          <Plus className="inline-block w-5 h-5 mr-2" />
          Nouvelle intervention
        </Link>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="inline-block w-4 h-4 mr-1" />
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les statuts</option>
              <option value="PLANIFIEE">Planifiée</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="inline-block w-4 h-4 mr-1" />
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les types</option>
              <option value="ETALONNAGE">Étalonnage</option>
              <option value="VERIFICATION">Vérification</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="REPARATION">Réparation</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Date prévue</th>
                <th className="table-header-cell">Instrument</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Statut</th>
                <th className="table-header-cell">Résultat</th>
                <th className="table-header-cell">Fournisseur</th>
                <th className="table-header-cell">Coût</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredInterventions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Aucune intervention trouvée
                  </td>
                </tr>
              ) : (
                filteredInterventions.map((intervention) => (
                  <tr 
                    key={intervention.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    onClick={() => navigate(`/interventions/${intervention.id}`)}
                  >
                    <td className="table-cell">{formatDate(intervention.scheduledDate)}</td>
                    <td className="table-cell">
                      <Link
                        to={`/instruments/${intervention.instrument?.id}`}
                        className="text-primary-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {intervention.instrument?.name}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {intervention.instrument?.serialNumber}
                      </div>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={intervention.type} />
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={intervention.status} />
                    </td>
                    <td className="table-cell">
                      {intervention.conformityResult ? (
                        <StatusBadge status={intervention.conformityResult} />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="table-cell">{intervention.supplier?.name || '-'}</td>
                    <td className="table-cell">{formatCurrency(intervention.cost)}</td>
                    <td className="table-cell">
                      <span className="text-primary-600 font-medium">
                        Voir →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InterventionsPage;


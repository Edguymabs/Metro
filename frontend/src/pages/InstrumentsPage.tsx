import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { instrumentService } from '../services/instrumentService';
import { Instrument } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { formatDate } from '../utils/format';
import { Plus, Search, Filter } from 'lucide-react';

const InstrumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadInstruments();
  }, [searchTerm, statusFilter]);

  const loadInstruments = async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const data = await instrumentService.getAll(params);
      setInstruments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des instruments:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (date: string | undefined) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/' },
          { label: 'Instruments' }
        ]}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instruments</h1>
          <p className="mt-1 text-gray-600">Gestion du parc d'instruments de mesure</p>
        </div>
        <Link to="/instruments/nouveau" className="btn-primary">
          <Plus className="inline-block w-5 h-5 mr-2" />
          Nouvel instrument
        </Link>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="inline-block w-4 h-4 mr-1" />
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Numéro de série, nom, marque, modèle..."
              className="input-field"
            />
          </div>
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
              <option value="CONFORME">Conforme</option>
              <option value="NON_CONFORME">Non conforme</option>
              <option value="EN_MAINTENANCE">En maintenance</option>
              <option value="CASSE">Cassé</option>
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
                <th className="table-header-cell">Numéro de série</th>
                <th className="table-header-cell">Nom</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Site</th>
                <th className="table-header-cell">Statut</th>
                <th className="table-header-cell">Prochain étalonnage</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {instruments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun instrument trouvé
                  </td>
                </tr>
              ) : (
                instruments.map((instrument) => (
                  <tr 
                    key={instrument.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    onClick={() => navigate(`/instruments/${instrument.id}`)}
                  >
                    <td className="table-cell font-medium text-primary">
                      {instrument.serialNumber}
                    </td>
                    <td className="table-cell">
                      <div>{instrument.name}</div>
                      <div className="text-xs text-gray-500">
                        {instrument.brand} {instrument.model}
                      </div>
                    </td>
                    <td className="table-cell">{instrument.type?.name || '-'}</td>
                    <td className="table-cell">{instrument.site?.name || '-'}</td>
                    <td className="table-cell">
                      <StatusBadge status={instrument.status} />
                    </td>
                    <td className="table-cell">
                      {instrument.nextCalibrationDate ? (
                        <span
                          className={
                            isOverdue(instrument.nextCalibrationDate)
                              ? 'text-red-600 font-medium'
                              : ''
                          }
                        >
                          {formatDate(instrument.nextCalibrationDate)}
                          {isOverdue(instrument.nextCalibrationDate) && ' (En retard)'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="text-primary font-medium">
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

export default InstrumentsPage;


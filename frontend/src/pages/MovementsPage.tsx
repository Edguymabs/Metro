import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movementService } from '../services/movementService';
import { Movement } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { formatDate } from '../utils/format';
import { Plus, TruckIcon, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const MovementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'late'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const data = await movementService.getAll();
      setMovements(data);
    } catch (error) {
      showToast('Erreur lors du chargement des mouvements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMovements = () => {
    const now = new Date();
    
    switch (filter) {
      case 'pending':
        return movements.filter((m) => !m.actualReturnDate && m.type !== 'TRANSFERT');
      case 'late':
        return movements.filter(
          (m) =>
            !m.actualReturnDate &&
            m.expectedReturnDate &&
            new Date(m.expectedReturnDate) < now
        );
      default:
        return movements;
    }
  };

  const filteredMovements = getFilteredMovements();

  const isLate = (movement: Movement) => {
    if (movement.actualReturnDate || !movement.expectedReturnDate) return false;
    return new Date(movement.expectedReturnDate) < new Date();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Mouvements' }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TruckIcon className="w-8 h-8" />
            Mouvements d'instruments
          </h1>
          <p className="mt-1 text-gray-600">
            Suivez les enlèvements, retours et transferts d'instruments
          </p>
        </div>
        <Link to="/mouvements/nouveau" className="btn-primary">
          <Plus className="inline-block w-4 h-4 mr-2" />
          Nouveau mouvement
        </Link>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({movements.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En cours (
            {movements.filter((m) => !m.actualReturnDate && m.type !== 'TRANSFERT').length})
          </button>
          <button
            onClick={() => setFilter('late')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'late'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En retard (
            {
              movements.filter(
                (m) =>
                  !m.actualReturnDate &&
                  m.expectedReturnDate &&
                  new Date(m.expectedReturnDate) < new Date()
              ).length
            }
            )
          </button>
        </div>
      </div>

      {/* Liste des mouvements */}
      <div className="card">
        {filteredMovements.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Aucun mouvement enregistré</p>
            <Link to="/mouvements/nouveau" className="mt-4 inline-block text-primary-600 hover:underline">
              Créer le premier mouvement
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    Site départ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site arrivée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date départ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retour attendu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retour réel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr
                    key={movement.id}
                    className={`hover:bg-gray-50 cursor-pointer ${isLate(movement) ? 'bg-red-50' : ''}`}
                    onClick={() => navigate(`/mouvements/${movement.id}`)}
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/instruments/${movement.instrument?.id}`}
                        className="text-primary-600 hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {movement.instrument?.name}
                      </Link>
                      <p className="text-xs text-gray-500">{movement.instrument?.serialNumber}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={movement.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.fromSite?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.toSite?.name || movement.externalLocation || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(movement.departureDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {movement.expectedReturnDate ? (
                        <span className={isLate(movement) ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                          {formatDate(movement.expectedReturnDate)}
                          {isLate(movement) && <AlertCircle className="inline-block w-4 h-4 ml-1" />}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(movement.actualReturnDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movement.actualReturnDate ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Terminé
                        </span>
                      ) : isLate(movement) ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          En retard
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          En cours
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovementsPage;


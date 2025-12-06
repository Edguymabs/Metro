import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supplierService } from '../services/supplierService';
import { Supplier } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Plus, Search } from 'lucide-react';

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, [searchTerm]);

  const loadSuppliers = async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      
      const data = await supplierService.getAll(params);
      setSuppliers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Tableau de bord', href: '/' },
          { label: 'Fournisseurs' }
        ]}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="mt-1 text-gray-600">Gestion des prestataires métrologiques</p>
        </div>
        <Link to="/fournisseurs/nouveau" className="btn-primary">
          <Plus className="inline-block w-5 h-5 mr-2" />
          Nouveau fournisseur
        </Link>
      </div>

      {/* Recherche */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Search className="inline-block w-4 h-4 mr-1" />
          Recherche
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nom, contact, email..."
          className="input-field"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Aucun fournisseur trouvé
            </div>
          ) : (
            suppliers.map((supplier) => (
              <Link
                key={supplier.id}
                to={`/fournisseurs/${supplier.id}`}
                className="card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                  {!supplier.active && (
                    <span className="badge badge-gray text-xs">Inactif</span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {supplier.contactName && (
                    <p>
                      <span className="font-medium">Contact:</span> {supplier.contactName}
                    </p>
                  )}
                  {supplier.email && (
                    <p>
                      <span className="font-medium">Email:</span> {supplier.email}
                    </p>
                  )}
                  {supplier.phone && (
                    <p>
                      <span className="font-medium">Tél:</span> {supplier.phone}
                    </p>
                  )}
                  {supplier.accreditations.length > 0 && (
                    <div>
                      <span className="font-medium">Accréditations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {supplier.accreditations.map((accred, idx) => (
                          <span key={idx} className="badge badge-success text-xs">
                            {accred}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-primary-600 text-sm font-medium">
                    Voir les détails →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { siteService } from '../services/siteService';
import { Site } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, MapPin } from 'lucide-react';

const SitesPage: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const data = await siteService.getAll();
      setSites(data);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
          <p className="mt-1 text-gray-600">Gestion des sites de l'entreprise</p>
        </div>
        <Link to="/sites/nouveau" className="btn-primary">
          <Plus className="inline-block w-5 h-5 mr-2" />
          Nouveau site
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sites.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Aucun site trouvé
            </div>
          ) : (
            sites.map((site) => (
              <Link
                key={site.id}
                to={`/sites/${site.id}`}
                className="card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                    {site.name}
                  </h3>
                  {!site.active && (
                    <span className="badge badge-gray text-xs">Inactif</span>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {site.address && <p>{site.address}</p>}
                  {(site.postalCode || site.city) && (
                    <p>
                      {site.postalCode} {site.city}
                    </p>
                  )}
                  {site.country && <p>{site.country}</p>}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {(site as any)._count?.instruments || 0} instruments
                  </span>
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

export default SitesPage;


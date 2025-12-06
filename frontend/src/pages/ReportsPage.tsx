import React, { useEffect, useState } from 'react';
import { instrumentService } from '../services/instrumentService';
import { interventionService } from '../services/interventionService';
import { DashboardStats, InterventionStats } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/format';
import { Download, FileText, TrendingUp, AlertCircle } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [instrumentStats, setInstrumentStats] = useState<DashboardStats | null>(null);
  const [interventionStats, setInterventionStats] = useState<InterventionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [instStats, intStats] = await Promise.all([
        instrumentService.getStats(),
        interventionService.getStats(),
      ]);
      setInstrumentStats(instStats);
      setInterventionStats(intStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const conformityRate = interventionStats
    ? ((interventionStats.totalInterventions - interventionStats.nonConformities) /
        interventionStats.totalInterventions) *
      100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports et Analyses</h1>
          <p className="mt-1 text-gray-600">Analyses et indicateurs de performance</p>
        </div>
        <button className="btn-primary">
          <Download className="inline-block w-5 h-5 mr-2" />
          Exporter PDF
        </button>
      </div>

      {/* Indicateurs principaux */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Budget Total</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(interventionStats?.totalCost || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de Conformité</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {conformityRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Non-Conformités</p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {interventionStats?.nonConformities || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coût Moyen</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(
                  interventionStats?.totalInterventions
                    ? (interventionStats.totalCost || 0) / interventionStats.totalInterventions
                    : 0
                )}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Détails des interventions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Résumé des Interventions
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total des interventions</p>
              <p className="text-2xl font-bold text-gray-900">
                {interventionStats?.totalInterventions || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Interventions en retard</p>
              <p className="text-2xl font-bold text-red-600">
                {interventionStats?.overdueInterventions || 0}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Par statut</h3>
            <div className="space-y-2">
              {interventionStats?.interventionsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.status}</span>
                  <span className="text-sm font-medium text-gray-900">{item._count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Par type</h3>
            <div className="space-y-2">
              {interventionStats?.interventionsByType.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.type}</span>
                  <span className="text-sm font-medium text-gray-900">{item._count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Détails des instruments */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Résumé des Instruments
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {instrumentStats?.totalInstruments || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-2xl font-bold text-red-600">
                {instrumentStats?.overdueCalibrations || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">À venir (30j)</p>
              <p className="text-2xl font-bold text-yellow-600">
                {instrumentStats?.upcomingCalibrations || 0}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Par statut</h3>
            <div className="space-y-2">
              {instrumentStats?.instrumentsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.status}</span>
                  <span className="text-sm font-medium text-gray-900">{item._count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="card bg-yellow-50 border border-yellow-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
          Actions Recommandées
        </h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {instrumentStats && instrumentStats.overdueCalibrations > 0 && (
            <li className="flex items-start">
              <span className="text-red-600 mr-2">•</span>
              <span>
                {instrumentStats.overdueCalibrations} instrument(s) en retard d'étalonnage nécessitent
                une intervention immédiate
              </span>
            </li>
          )}
          {instrumentStats && instrumentStats.upcomingCalibrations > 0 && (
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span>
                {instrumentStats.upcomingCalibrations} étalonnage(s) prévu(s) dans les 30 prochains
                jours - planifiez les interventions
              </span>
            </li>
          )}
          {interventionStats && interventionStats.nonConformities > 0 && (
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>
                {interventionStats.nonConformities} non-conformité(s) détectée(s) - examinez les
                instruments concernés
              </span>
            </li>
          )}
          {interventionStats && conformityRate < 95 && (
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>
                Taux de conformité inférieur à 95% - analysez les causes et mettez en place des
                actions correctives
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ReportsPage;


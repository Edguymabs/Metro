import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { instrumentService } from '../services/instrumentService';
import { interventionService } from '../services/interventionService';
import { DashboardStats, InterventionStats } from '../types';
import { translateStatus } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertCircle, Clock, Wrench } from 'lucide-react';

const DashboardPage: React.FC = () => {
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

  // Palette de gris pour les graphiques (avec primary pour accent)
  const COLORS = ['#52525b', '#71717a', '#a1a1aa', '#3f3f46', '#27272a', '#fecb00'];

  const statusData = instrumentStats?.instrumentsByStatus.map(item => ({
    name: translateStatus(item.status),
    value: item._count,
  })) || [];

  const interventionTypeData = interventionStats?.interventionsByType.map(item => ({
    name: translateStatus(item.type),
    value: item._count,
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="relative overflow-hidden rounded-pem bg-gradient-to-r from-gray-800 to-gray-700 p-8 shadow-premium-lg border border-gray-600">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-gray-600/30 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-oswald text-gray-100 mb-2">Tableau de bord</h1>
          <p className="text-gray-300 font-fira text-lg">Vue d'ensemble de votre activité métrologique</p>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/instruments"
          className="group relative bg-white rounded-pem p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-200 rounded-pem group-hover:bg-gray-700 transition-colors duration-300">
                <Wrench className="w-6 h-6 text-gray-600 group-hover:text-gray-200 transition-colors" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{instrumentStats?.totalInstruments || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Instruments</p>
            <div className="mt-4 flex items-center text-gray-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
              Voir tous les instruments →
            </div>
          </div>
        </Link>

        <Link
          to="/etalonnages?filter=overdue"
          className="group relative bg-white rounded-pem p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-150 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-300 rounded-pem group-hover:bg-gray-600 transition-colors duration-300">
                <AlertCircle className="w-6 h-6 text-gray-700 group-hover:text-gray-200 transition-colors" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{instrumentStats?.overdueCalibrations || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">En retard</p>
            <div className="mt-4 flex items-center text-gray-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
              Voir les instruments →
            </div>
          </div>
        </Link>

        <Link
          to="/etalonnages?filter=upcoming"
          className="group relative bg-white rounded-pem p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-200 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-250 rounded-pem group-hover:bg-gray-500 transition-colors duration-300">
                <Clock className="w-6 h-6 text-gray-600 group-hover:text-gray-200 transition-colors" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{instrumentStats?.upcomingCalibrations || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">À venir (30j)</p>
            <div className="mt-4 flex items-center text-gray-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
              Voir les instruments →
            </div>
          </div>
        </Link>

        <Link
          to="/interventions?filter=nonconform"
          className="group relative bg-white rounded-pem p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-300 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-400 rounded-pem group-hover:bg-gray-600 transition-colors duration-300">
                <AlertCircle className="w-6 h-6 text-gray-700 group-hover:text-gray-200 transition-colors" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{interventionStats?.nonConformities || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Non-conformités</p>
            <div className="mt-4 flex items-center text-gray-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
              Voir les interventions →
            </div>
          </div>
        </Link>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-pem shadow-premium p-8 border border-gray-200">
          <h2 className="mb-6 text-xl font-oswald text-gray-900 border-b border-gray-200 pb-4">Répartition des instruments par statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '0px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-pem shadow-premium p-8 border border-gray-200">
          <h2 className="mb-6 text-xl font-oswald text-gray-900 border-b border-gray-200 pb-4">Interventions par type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interventionTypeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#52525b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525b' }} />
              <Tooltip
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ borderRadius: '0px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#52525b" name="Nombre" radius={[0, 0, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-gray-100 rounded-pem p-6 border border-gray-300">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Interventions</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {interventionStats?.totalInterventions || 0}
          </p>
        </div>

        <div className="bg-gray-100 rounded-pem p-6 border border-gray-300">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Coût Total</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
              interventionStats?.totalCost || 0
            )}
          </p>
        </div>

        <div className="bg-gray-100 rounded-pem p-6 border border-gray-300">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Interventions en retard</h3>
          <p className="mt-2 text-3xl font-bold text-gray-700">
            {interventionStats?.overdueInterventions || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


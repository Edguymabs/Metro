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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statusData = instrumentStats?.instrumentsByStatus.map(item => ({
    name: translateStatus(item.status),
    value: item._count,
  })) || [];

  const interventionTypeData = interventionStats?.interventionsByType.map(item => ({
    name: translateStatus(item.type),
    value: item._count,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-gray-600">Vue d'ensemble de votre activité métrologique</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/instruments"
          className="card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Instruments</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {instrumentStats?.totalInstruments || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <span className="mt-2 text-sm text-primary-600 font-medium">
            Voir tous les instruments →
          </span>
        </Link>

        <Link
          to="/etalonnages?filter=overdue"
          className="card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En retard</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {instrumentStats?.overdueCalibrations || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <span className="mt-2 text-sm text-primary-600 font-medium">
            Voir les instruments →
          </span>
        </Link>

        <Link
          to="/etalonnages?filter=upcoming"
          className="card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">À venir (30j)</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {instrumentStats?.upcomingCalibrations || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <span className="mt-2 text-sm text-primary-600 font-medium">
            Voir les instruments →
          </span>
        </Link>

        <Link
          to="/interventions?filter=nonconform"
          className="card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non-conformités</p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {interventionStats?.nonConformities || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <span className="mt-2 text-sm text-primary-600 font-medium">
            Voir les interventions →
          </span>
        </Link>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Répartition des instruments par statut</h2>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Interventions par type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interventionTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Nombre" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600">Total Interventions</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {interventionStats?.totalInterventions || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600">Coût Total</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
              interventionStats?.totalCost || 0
            )}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600">Interventions en retard</h3>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {interventionStats?.overdueInterventions || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


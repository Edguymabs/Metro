import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Toast from './components/common/Toast';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Instruments
import InstrumentsPage from './pages/InstrumentsPage';
import InstrumentDetailPage from './pages/InstrumentDetailPage';
import InstrumentFormPage from './pages/InstrumentFormPage';

// Interventions
import InterventionsPage from './pages/InterventionsPage';
import InterventionDetailPage from './pages/InterventionDetailPage';
import InterventionFormPage from './pages/InterventionFormPage';

// Fournisseurs
import SuppliersPage from './pages/SuppliersPage';
import SupplierDetailPage from './pages/SupplierDetailPage';
import SupplierFormPage from './pages/SupplierFormPage';

// Sites
import SitesPage from './pages/SitesPage';
import SiteDetailPage from './pages/SiteDetailPage';
import SiteFormPage from './pages/SiteFormPage';

// Mouvements
import MovementsPage from './pages/MovementsPage';
import MovementFormPage from './pages/MovementFormPage';

// Utilisateurs
import UsersPage from './pages/UsersPage';
import UserFormPage from './pages/UserFormPage';

// Paramètres et rapports
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';

// Configuration des interventions
import InterventionConfigPage from './pages/InterventionConfigPage';
import InterventionConfigFormPage from './pages/InterventionConfigFormPage';

// Messages de maintenance
import AccountPage from './pages/AccountPage';
import MaintenanceMessagesPage from './pages/MaintenanceMessagesPage';
import MaintenanceMessageFormPage from './pages/MaintenanceMessageFormPage';

// Étalonnage avancé
import CalibrationMethodsPage from './pages/CalibrationMethodsPage';
import CalibrationMethodFormPage from './pages/CalibrationMethodFormPage';
import CalibrationMethodDetailPage from './pages/CalibrationMethodDetailPage';
import CalibrationMethodBulkPage from './pages/CalibrationMethodBulkPage';
import CalibrationCalendarsPage from './pages/CalibrationCalendarsPage';
import CalibrationCalendarFormPage from './pages/CalibrationCalendarFormPage';
import CalibrationPlanningPage from './pages/CalibrationPlanningPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Toast />
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Instruments */}
            <Route
              path="/instruments"
              element={
                <PrivateRoute>
                  <Layout>
                    <InstrumentsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/instruments/nouveau"
              element={
                <PrivateRoute>
                  <Layout>
                    <InstrumentFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/instruments/:id/modifier"
              element={
                <PrivateRoute>
                  <Layout>
                    <InstrumentFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/instruments/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <InstrumentDetailPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Interventions */}
            <Route
              path="/interventions"
              element={
                <PrivateRoute>
                  <Layout>
                    <InterventionsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/interventions/nouvelle"
              element={
                <PrivateRoute>
                  <Layout>
                    <InterventionFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/interventions/:id/modifier"
              element={
                <PrivateRoute>
                  <Layout>
                    <InterventionFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/interventions/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <InterventionDetailPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Configuration des interventions */}
            <Route
              path="/parametres/interventions"
              element={
                <PrivateRoute>
                  <Layout>
                    <InterventionConfigPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/parametres/interventions/nouvelle"
              element={
                <PrivateRoute>
                  <Layout>
                    <InterventionConfigFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/parametres/interventions/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <InterventionConfigFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/parametres/interventions/:id/modifier"
              element={
                <PrivateRoute>
                  <Layout>
                    <InterventionConfigFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Fournisseurs */}
            <Route
              path="/fournisseurs"
              element={
                <PrivateRoute>
                  <Layout>
                    <SuppliersPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/fournisseurs/nouveau"
              element={
                <PrivateRoute>
                  <Layout>
                    <SupplierFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/fournisseurs/:id/modifier"
              element={
                <PrivateRoute>
                  <Layout>
                    <SupplierFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/fournisseurs/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <SupplierDetailPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Sites */}
            <Route
              path="/sites"
              element={
                <PrivateRoute>
                  <Layout>
                    <SitesPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/sites/nouveau"
              element={
                <PrivateRoute>
                  <Layout>
                    <SiteFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/sites/:id/modifier"
              element={
                <PrivateRoute>
                  <Layout>
                    <SiteFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/sites/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <SiteDetailPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Mouvements */}
            <Route
              path="/mouvements"
              element={
                <PrivateRoute>
                  <Layout>
                    <MovementsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/mouvements/nouveau"
              element={
                <PrivateRoute>
                  <Layout>
                    <MovementFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Utilisateurs (Admin) */}
            <Route
              path="/utilisateurs"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <Layout>
                    <UsersPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/utilisateurs/nouveau"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <Layout>
                    <UserFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/utilisateurs/:id/modifier"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <Layout>
                    <UserFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Paramètres */}
            <Route
              path="/parametres"
              element={
                <PrivateRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Compte utilisateur */}
            <Route
              path="/mon-compte"
              element={
                <PrivateRoute>
                  <Layout>
                    <AccountPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Messages de maintenance */}
            <Route
              path="/mon-compte/maintenance"
              element={
                <PrivateRoute>
                  <Layout>
                    <MaintenanceMessagesPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/mon-compte/maintenance/nouveau"
              element={
                <PrivateRoute>
                  <Layout>
                    <MaintenanceMessageFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/mon-compte/maintenance/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <MaintenanceMessageFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/mon-compte/maintenance/:id/modifier"
              element={
                <PrivateRoute>
                  <Layout>
                    <MaintenanceMessageFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Rapports */}
            <Route
              path="/rapports"
              element={
                <PrivateRoute>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Planning des étalonnages */}
            <Route
              path="/etalonnages"
              element={
                <PrivateRoute>
                  <Layout>
                    <CalibrationPlanningPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Méthodes d'étalonnage */}
            <Route
              path="/methodes-etalonnage"
              element={
                <PrivateRoute>
                  <Layout>
                    <CalibrationMethodsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/methodes-etalonnage/nouvelle"
              element={
                <PrivateRoute>
                  <Layout>
                    <CalibrationMethodFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/methodes-etalonnage/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <CalibrationMethodDetailPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/methodes-etalonnage/:id/modifier"
              element={
                <PrivateRoute>
                  <Layout>
                    <CalibrationMethodFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/methodes-etalonnage/gestion-masse"
              element={
                <PrivateRoute>
                  <Layout>
                    <CalibrationMethodBulkPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Calendriers d'étalonnage */}
            <Route
              path="/calendriers-etalonnage"
              element={
                <PrivateRoute>
                  <Layout>
                    <CalibrationCalendarsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/calendriers-etalonnage/nouveau"
              element={
                <PrivateRoute>
                  <Layout>
                    <CalibrationCalendarFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/calendriers-etalonnage/:id/modifier"
              element={
                <PrivateRoute>
                  <Layout>
                    <CalibrationCalendarFormPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;


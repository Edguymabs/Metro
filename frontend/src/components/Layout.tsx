import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MaintenanceNotification from './MaintenanceNotification';
import {
  LayoutDashboard,
  Wrench,
  Calendar,
  Building2,
  FileText,
  LogOut,
  Menu,
  X,
  TruckIcon,
  Users,
  Settings,
  ClipboardCheck,
  MapPin,
  User,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    { name: 'Instruments', href: '/instruments', icon: Wrench },
    { name: 'Étalonnages', href: '/etalonnages', icon: ClipboardCheck },
    { name: 'Interventions', href: '/interventions', icon: Calendar },
    { name: 'Mouvements', href: '/mouvements', icon: TruckIcon },
    { name: 'Fournisseurs', href: '/fournisseurs', icon: Building2 },
    { name: 'Sites', href: '/sites', icon: MapPin },
    { name: 'Rapports', href: '/rapports', icon: FileText },
    ...(user?.role === 'ADMIN' ? [{ name: 'Utilisateurs', href: '/utilisateurs', icon: Users }] : []),
    { name: 'Mon compte', href: '/mon-compte', icon: User },
    { name: 'Paramètres', href: '/parametres', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Background is handled by body gradient in index.css */}

      {/* Sidebar pour mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-800 shadow-2xl border-r border-gray-700">
            <div className="flex items-center justify-between h-20 px-6 bg-gray-900 border-b border-gray-700">
              <span className="text-2xl font-oswald font-normal text-gray-100 tracking-widest uppercase">Metro</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-200 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto bg-gray-800">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-pem transition-all duration-200 group ${isActive(item.href)
                      ? 'bg-gray-700 text-primary border-l-4 border-primary'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive(item.href) ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'
                    }`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar pour desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-gray-800 border-r border-gray-700 shadow-xl relative overflow-hidden">
          {/* Decorative background element for sidebar - Gris subtil */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 bg-gradient-to-b from-gray-700/20 to-transparent"></div>

          <div className="flex items-center h-20 px-8 bg-gray-900 border-b border-gray-700 relative z-10">
            <span className="text-3xl font-oswald font-normal text-gray-100 tracking-[0.2em] uppercase">Metro</span>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto relative z-10 bg-gray-800">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-pem transition-all duration-300 group ${isActive(item.href)
                    ? 'bg-gray-700 text-primary border-l-4 border-primary translate-x-1'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200 hover:translate-x-1'
                  }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive(item.href) ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'
                  }`} />
                <span className="font-fira tracking-wide">{item.name}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(254,203,0,0.8)]"></div>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex-shrink-0 p-6 border-t border-gray-700 bg-gray-850 relative z-10">
            <div className="flex items-center group cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-primary border border-gray-600 shadow-inner">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 ml-3">
                <p className="text-sm font-medium text-gray-200 group-hover:text-primary transition-colors truncate font-oswald tracking-wide">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate font-fira">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 text-gray-500 hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-700"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Barre supérieure mobile */}
        <div className="sticky top-0 z-40 flex items-center h-16 bg-gray-100/95 backdrop-blur-md border-b border-gray-300 lg:hidden px-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 text-xl font-oswald text-gray-800 tracking-widest">METRO</span>
        </div>

        {/* Contenu */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className={`max-w-7xl mx-auto space-y-6 ${sidebarOpen ? 'blur-sm lg:blur-0' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Notifications de maintenance */}
      <MaintenanceNotification />
    </div>
  );
};

export default Layout;


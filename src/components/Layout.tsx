import React, { memo, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToastContext } from '../contexts/ToastContext';
import ToastContainer from './Toast';
import { User, LogOut, BarChart3, Settings, Shield, Home } from 'lucide-react';
import { useBreakpoint } from '../hooks/useUtils';

const Layout: React.FC = memo(() => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toasts, removeToast } = useToastContext();
  const navigate = useNavigate();
  const { isMd } = useBreakpoint();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: true },
    { name: 'Análisis', href: '/analytics', icon: BarChart3, current: false },
    { name: 'Seguridad', href: '/security', icon: Shield, current: false },
    { name: 'Configuración', href: '/settings', icon: Settings, current: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for larger screens */}
      {isAuthenticated && isMd && (
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="ml-3 text-xl font-bold text-gray-900">ML Platform</span>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors`}
                  >
                    <IconComponent
                      className={`${
                        item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`}
                    />
                    {item.name}
                  </a>
                );
              })}
            </nav>
            {/* User section */}
            {user && (
              <div className="flex-shrink-0 p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.username}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation for mobile and non-authenticated users */}
        {(!isMd || !isAuthenticated) && (
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-primary-600" />
                  <h1 className="ml-3 text-xl font-bold text-gray-900">
                    ML Platform
                  </h1>
                </div>
                
                {isAuthenticated && user && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {user.username}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;

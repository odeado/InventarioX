import React, { useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const Layout = () => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const [appSettings, setAppSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setAppSettings(data);
        if (data.themeColors) {
          // Aplicamos una manera sencilla de sobreescribir el color principal en tailwind 4 dinámicamente
          document.documentElement.style.setProperty('--color-primary-600', data.themeColors);
          document.documentElement.style.setProperty('--color-primary-500', data.themeColors);
        }
      } catch (err) {}
    };
    loadSettings();
  }, [location.pathname]); // recargar settings si navegamos

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Productos', path: '/productos', icon: Package },
    { name: 'Facturas', path: '/facturas', icon: FileText },
    { name: 'Configuración', path: '/configuracion', icon: SettingsIcon },
  ];

  return (
    <div 
      className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300"
      style={{
        backgroundColor: appSettings?.themeBgColor || undefined,
        color: appSettings?.themeTextColor || undefined
      }}
    >
      {/* Sidebar */}
      <aside 
        className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex flex-col transition-colors duration-300"
        style={{
          backgroundColor: appSettings?.themeBgColor || undefined,
          color: appSettings?.themeTextColor || undefined,
          borderColor: appSettings?.themeBgColor ? `${appSettings.themeBgColor}33` : undefined
        }}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700" style={{ borderColor: appSettings?.themeBgColor ? `${appSettings.themeBgColor}33` : undefined }}>
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            {appSettings?.logoUrl ? (
              <img src={appSettings.logoUrl} alt="Logo" className="h-8 max-w-[140px] object-contain" />
            ) : (
              <>
                <Package className="h-6 w-6" />
                <span className="text-lg font-bold">{appSettings?.companyName || 'InventarioX'}</span>
              </>
            )}
          </div>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 font-medium' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
                style={isActive ? undefined : { color: appSettings?.themeTextColor ? `${appSettings.themeTextColor}cc` : undefined }}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700" style={{ borderColor: appSettings?.themeBgColor ? `${appSettings.themeBgColor}33` : undefined }}>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate" style={{ color: appSettings?.themeTextColor ? `${appSettings.themeTextColor}aa` : undefined }}>{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header 
          className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 z-10 sticky top-0 transition-colors duration-300"
          style={{
            backgroundColor: appSettings?.themeBgColor ? `${appSettings.themeBgColor}cc` : undefined,
            color: appSettings?.themeTextColor || undefined,
            borderColor: appSettings?.themeBgColor ? `${appSettings.themeBgColor}33` : undefined
          }}
        >
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100" style={{ color: appSettings?.themeTextColor || undefined }}>
            {navItems.find(i => i.path === location.pathname)?.name || 'Detalles'}
          </h1>
        </header>
        
        <div 
          className="flex-1 overflow-y-auto p-8"
          style={{
            backgroundColor: appSettings?.themeBgColor ? `${appSettings.themeBgColor}1c` : undefined
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

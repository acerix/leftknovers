import { Link, useLocation } from 'react-router';
import { Home, TrendingUp } from 'lucide-react';
import { useSettings } from '@/react-app/contexts/SettingsContext';

export default function Navigation() {
  const location = useLocation();
  const { t } = useSettings();

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/analytics', label: t('nav.analytics'), icon: TrendingUp },
  ];

  return (
    <nav className="flex items-center">
      <div className="flex items-center space-x-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useFoodItems } from '@/react-app/hooks/useFoodItems';
import { useNotifications } from '@/react-app/hooks/useNotifications';
import { useSettings } from '@/react-app/contexts/SettingsContext';
import FoodItemCard from '@/react-app/components/FoodItemCard';
import AddFoodForm from '@/react-app/components/AddFoodForm';
import ExpirationAlert from '@/react-app/components/ExpirationAlert';
import FriendsModal from '@/react-app/components/FriendsModal';
import SettingsModal from '@/react-app/components/SettingsModal';
import { Plus, Camera, Leaf, Apple, LogOut, User, Download, Users, Settings } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';

export default function Home() {
  const { user, logout } = useAuth();
  const { t } = useSettings();
  const { 
    items, 
    notificationPreferences, 
    loading, 
    error, 
    addItem, 
    markAsConsumed, 
    markAsExpired, 
    updateNotificationPreference 
  } = useFoodItems();
  useNotifications(); // Enable automatic notifications
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleAddItem = async (item: any) => {
    await addItem(item);
    setShowAddForm(false);
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leftknovers-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const stats = {
    total: items.length,
    expiringSoon: items.filter(item => {
      const daysUntilExpiration = Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiration <= 3;
    }).length,
    expired: items.filter(item => {
      const daysUntilExpiration = Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiration < 0;
    }).length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin">
          <Leaf className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('app.name')}</h1>
                <p className="text-gray-600 dark:text-gray-300">{t('app.tagline')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Navigation />
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
              >
                <Camera className="w-5 h-5" />
                <span className="hidden sm:inline">{t('home.addItem')}</span>
                <span className="sm:hidden">{t('add')}</span>
              </button>
              
              <button
                onClick={() => setShowFriendsModal(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={t('home.friends')}
              >
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="hidden sm:inline text-gray-700 dark:text-gray-300">{t('home.friends')}</span>
              </button>
              
              {/* User Menu */}
              <div className="relative user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors max-w-[150px] sm:max-w-none"
                >
                  {user?.google_user_data?.picture ? (
                    <img 
                      src={user.google_user_data.picture} 
                      alt="Profile" 
                      className="w-6 h-6 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium truncate hidden xs:block">
                    {user?.google_user_data?.given_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.google_user_data?.name || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowSettingsModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      {t('settings.title')}
                    </button>
                    <button
                      onClick={() => {
                        handleExport('json');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {t('home.exportJson')}
                    </button>
                    <button
                      onClick={() => {
                        handleExport('csv');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {t('home.exportCsv')}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('home.signOut')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Apple className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">{t('home.totalItems')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">!</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.expiringSoon}</p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">{t('home.expiringSoon')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-bold">×</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.expired}</p>
                  <p className="text-red-700 dark:text-red-300 text-sm">{t('home.expired')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Alerts */}
        <div className="mb-6">
          <ExpirationAlert />
        </div>

        {/* Food Items */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{t('error')}: {error}</p>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('home.noItems')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('home.noItemsDesc')}</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              {t('home.addFirstItem')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => {
              const preference = notificationPreferences.find(p => p.food_item_id === item.id);
              return (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  notificationPreference={preference}
                  onMarkConsumed={markAsConsumed}
                  onMarkExpired={markAsExpired}
                  onUpdateNotification={updateNotificationPreference}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <AddFoodForm
          onAdd={handleAddItem}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Friends Modal */}
      {showFriendsModal && (
        <FriendsModal
          onClose={() => setShowFriendsModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

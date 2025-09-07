import { useState } from 'react';
import { FoodItem, NotificationPreference } from '@/shared/types';
import { Calendar, MapPin, Clock, Check, Trash2, Bell } from 'lucide-react';
import NotificationSettings from './NotificationSettings';

interface FoodItemCardProps {
  item: FoodItem;
  notificationPreference?: NotificationPreference;
  onMarkConsumed: (id: number) => void;
  onMarkExpired: (id: number) => void;
  onUpdateNotification: (itemId: number, settings: { notification_interval: string; custom_minutes?: number; is_enabled: boolean }) => Promise<void>;
}

export default function FoodItemCard({ 
  item, 
  notificationPreference, 
  onMarkConsumed, 
  onMarkExpired, 
  onUpdateNotification 
}: FoodItemCardProps) {
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const expirationDate = new Date(item.expiration_date);
  const today = new Date();
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const getExpirationStatus = () => {
    if (daysUntilExpiration < 0) return { color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30', text: 'Expired', urgent: true };
    if (daysUntilExpiration === 0) return { color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30', text: 'Expires today', urgent: true };
    if (daysUntilExpiration === 1) return { color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30', text: 'Expires tomorrow', urgent: true };
    if (daysUntilExpiration <= 3) return { color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30', text: `${daysUntilExpiration} days left`, urgent: false };
    return { color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30', text: `${daysUntilExpiration} days left`, urgent: false };
  };

  const status = getExpirationStatus();

  return (
    <>
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/10 overflow-hidden w-full ${status.urgent ? 'ring-2 ring-red-200 dark:ring-red-400' : ''}`}>
        {item.photo_url && (
          <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
            <img 
              src={item.photo_url} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="space-y-2 w-full overflow-hidden">
          <div className="flex items-start justify-between gap-2 w-full overflow-hidden">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">{item.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${status.color}`}>
              {status.text}
            </span>
          </div>
          
          {item.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm break-words overflow-hidden text-ellipsis line-clamp-2">{item.description}</p>
          )}
          
          <div className="w-full overflow-hidden">
            <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400 overflow-hidden">
              <div className="flex items-center gap-1 w-full overflow-hidden">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-xs overflow-hidden text-ellipsis whitespace-nowrap flex-1">{expirationDate.toLocaleDateString()}</span>
              </div>
              
              {item.storage_location && (
                <div className="flex items-center gap-1 w-full overflow-hidden">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-xs overflow-hidden text-ellipsis whitespace-nowrap flex-1">{item.storage_location}</span>
                </div>
              )}
              
              {item.category && (
                <div className="flex items-center gap-1 w-full overflow-hidden">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-xs overflow-hidden text-ellipsis whitespace-nowrap flex-1 break-all">{item.category}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 w-full overflow-hidden">
            <button
              onClick={() => onMarkConsumed(item.id)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-xs sm:text-sm font-medium min-w-0 overflow-hidden"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Consumed</span>
            </button>
            
            <button
              onClick={() => setShowNotificationSettings(true)}
              className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors text-xs sm:text-sm flex-shrink-0 ${
                notificationPreference?.is_enabled 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Notification settings"
            >
              <Bell className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onMarkExpired(item.id)}
              className="flex items-center justify-center gap-1 px-2 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-xs sm:text-sm flex-shrink-0"
              title="Mark as expired"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Notification indicator */}
          {notificationPreference?.is_enabled && (
            <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded w-full overflow-hidden">
              <Bell className="w-3 h-3 flex-shrink-0" />
              <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                {notificationPreference.notification_interval === 'custom' && notificationPreference.custom_minutes
                  ? `${notificationPreference.custom_minutes}m before expiry`
                  : `${notificationPreference.notification_interval} before expiry`
                }
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings
          foodItemId={item.id}
          currentPreference={notificationPreference}
          onSave={(settings) => onUpdateNotification(item.id, settings)}
          onClose={() => setShowNotificationSettings(false)}
        />
      )}
    </>
  );
}

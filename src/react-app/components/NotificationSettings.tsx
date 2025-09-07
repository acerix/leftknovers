import { useState } from 'react';
import { NotificationPreference } from '@/shared/types';
import { Bell, Clock, X, Mail } from 'lucide-react';

interface NotificationSettingsProps {
  foodItemId: number;
  currentPreference?: NotificationPreference;
  onSave: (settings: { notification_interval: string; custom_minutes?: number; is_enabled: boolean; notification_email?: string }) => Promise<void>;
  onClose: () => void;
}

export default function NotificationSettings({ 
  foodItemId: _, 
  currentPreference, 
  onSave, 
  onClose 
}: NotificationSettingsProps) {
  const [interval, setInterval] = useState(currentPreference?.notification_interval || '24h');
  const [customMinutes, setCustomMinutes] = useState(
    currentPreference?.custom_minutes?.toString() || ''
  );
  const [isEnabled, setIsEnabled] = useState(currentPreference?.is_enabled ?? true);
  const [notificationEmail, setNotificationEmail] = useState(
    currentPreference?.notification_email || ''
  );
  const [loading, setLoading] = useState(false);

  const intervalOptions = [
    { value: '15m', label: '15 minutes', minutes: 15 },
    { value: '6h', label: '6 hours', minutes: 360 },
    { value: '12h', label: '12 hours', minutes: 720 },
    { value: '24h', label: '24 hours', minutes: 1440 },
    { value: '2d', label: '2 days', minutes: 2880 },
    { value: '3d', label: '3 days', minutes: 4320 },
    { value: 'custom', label: 'Custom', minutes: null },
    { value: 'off', label: 'Off', minutes: null },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalInterval = interval;
      let finalCustomMinutes: number | undefined;

      if (interval === 'custom' && customMinutes) {
        const minutes = parseInt(customMinutes);
        if (minutes > 0) {
          finalCustomMinutes = minutes;
        } else {
          alert('Please enter a valid number of minutes');
          setLoading(false);
          return;
        }
      }

      await onSave({
        notification_interval: finalInterval,
        custom_minutes: finalCustomMinutes,
        is_enabled: interval !== 'off' && isEnabled,
        notification_email: notificationEmail.trim() || undefined,
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewText = () => {
    if (interval === 'off' || !isEnabled) {
      return 'No notifications will be sent';
    }
    
    if (interval === 'custom' && customMinutes) {
      const minutes = parseInt(customMinutes);
      if (minutes < 60) {
        return `Notify every ${minutes} minutes before expiration`;
      } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `Notify every ${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''} before expiration`;
      } else {
        const days = Math.floor(minutes / 1440);
        const remainingHours = Math.floor((minutes % 1440) / 60);
        return `Notify every ${days}d${remainingHours > 0 ? ` ${remainingHours}h` : ''} before expiration`;
      }
    }
    
    const option = intervalOptions.find(opt => opt.value === interval);
    return option ? `Notify every ${option.label.toLowerCase()} before expiration` : '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Enable Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled && interval !== 'off'}
                onChange={(e) => {
                  setIsEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setInterval('off');
                  } else if (interval === 'off') {
                    setInterval('24h');
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Interval Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notification Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {intervalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setInterval(option.value);
                    if (option.value === 'off') {
                      setIsEnabled(false);
                    } else {
                      setIsEnabled(true);
                    }
                  }}
                  disabled={!isEnabled && option.value !== 'off'}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    interval === option.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Minutes Input */}
          {interval === 'custom' && isEnabled && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Custom Minutes Before Expiration
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="525600" // 1 year in minutes
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="Enter minutes"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <span className="text-sm text-gray-500">minutes</span>
              </div>
              <p className="text-xs text-gray-500">
                Examples: 15 (15 min), 60 (1 hour), 1440 (1 day), 10080 (1 week)
              </p>
            </div>
          )}

          {/* Email Address Input */}
          {isEnabled && interval !== 'off' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notification Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="Enter email address (leave blank to use account email)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <p className="text-xs text-gray-500">
                Leave blank to use your account email address
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Preview</p>
                <p className="text-sm text-blue-700">{getPreviewText()}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || (interval === 'custom' && !customMinutes)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

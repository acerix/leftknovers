import { X, Settings, Sun, Moon, Globe } from 'lucide-react';
import { useSettings } from '@/react-app/contexts/SettingsContext';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { language, theme, setLanguage, setTheme, t } = useSettings();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings.title')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Language Setting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.language')}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t('settings.english')}
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  language === 'fr'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t('settings.french')}
              </button>
            </div>
          </div>

          {/* Theme Setting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.theme')}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                {t('settings.lightMode')}
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Moon className="w-4 h-4" />
                {t('settings.darkMode')}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t('app.name')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('app.tagline')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </div>
  );
}

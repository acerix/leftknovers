import { useExpiringItems } from '@/react-app/hooks/useFoodItems';
import { AlertTriangle, Bell } from 'lucide-react';

export default function ExpirationAlert() {
  const { items, loading } = useExpiringItems();

  if (loading || items.length === 0) return null;

  const urgentItems = items.filter(item => {
    const daysUntilExpiration = Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 1;
  });

  const warningItems = items.filter(item => {
    const daysUntilExpiration = Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration > 1 && daysUntilExpiration <= 3;
  });

  return (
    <div className="space-y-3">
      {urgentItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Urgent - Expiring Soon!</h3>
          </div>
          <div className="space-y-1">
            {urgentItems.map(item => (
              <div key={item.id} className="text-sm text-red-800">
                <span className="font-medium">{item.name}</span>{item.description && ` - ${item.description}`} - {new Date(item.expiration_date).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}

      {warningItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Reminder - Expiring This Week</h3>
          </div>
          <div className="space-y-1">
            {warningItems.map(item => (
              <div key={item.id} className="text-sm text-yellow-800">
                <span className="font-medium">{item.name}</span>{item.description && ` - ${item.description}`} - {new Date(item.expiration_date).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

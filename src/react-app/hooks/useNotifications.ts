import { useState, useEffect } from 'react';

export function useNotifications() {
  const [lastNotificationCheck, setLastNotificationCheck] = useState<Date | null>(null);

  const sendExpirationNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const result = await response.json();
        setLastNotificationCheck(new Date());
        return result;
      }
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  };

  // Check for expiring items more frequently for better responsiveness
  useEffect(() => {
    const checkNotifications = async () => {
      const now = new Date();
      const lastCheck = lastNotificationCheck;
      
      // If no previous check or last check was more than 5 minutes ago (for testing)
      if (!lastCheck || (now.getTime() - lastCheck.getTime()) > 5 * 60 * 1000) {
        console.log('Checking for notifications...');
        const result = await sendExpirationNotifications();
        console.log('Notification check result:', result);
      }
    };

    // Check immediately
    checkNotifications();
    
    // Set up interval to check every 5 minutes for testing
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [lastNotificationCheck]);

  return { sendExpirationNotifications, lastNotificationCheck };
}

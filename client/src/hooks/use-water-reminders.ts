import { useEffect, useRef } from 'react';
import { loadSettings } from '@/lib/storage';

export function useWaterReminders() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationTimeRef = useRef<number>(0);

  useEffect(() => {
    const checkAndNotifyWater = () => {
      const settings = loadSettings();
      
      if (!settings.waterReminderEnabled) {
        return;
      }

      const now = new Date();
      const currentHour = now.getHours();

      // Check if current time is within reminder window
      if (currentHour < settings.waterReminderStartHour || 
          currentHour >= settings.waterReminderEndHour) {
        return;
      }

      // Check if enough time has passed since last notification
      const timeSinceLastNotification = now.getTime() - lastNotificationTimeRef.current;
      const intervalMs = settings.waterReminderIntervalMinutes * 60 * 1000;

      if (timeSinceLastNotification < intervalMs) {
        return;
      }

      // Request notification permission if needed
      if ('Notification' in window && Notification.permission === 'granted') {
        lastNotificationTimeRef.current = now.getTime();
        
        // Send message to Service Worker to show notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'WATER_REMINDER',
            title: '💧 Ricordati di bere!',
            body: 'È ora di bere un bicchiere d\'acqua e stare idratato/a',
            tag: 'water-reminder',
          });
        } else {
          // Fallback: show notification directly if SW not available
          new Notification('💧 Ricordati di bere!', {
            body: 'È ora di bere un bicchiere d\'acqua e stare idratato/a',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2322c55e"/><text x="50" y="55" font-size="60" font-weight="bold" fill="white" text-anchor="middle">💧</text></svg>',
            tag: 'water-reminder',
          });
        }
      }
    };

    // Check every minute
    intervalRef.current = setInterval(checkAndNotifyWater, 60000);
    
    // Initial check
    checkAndNotifyWater();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}

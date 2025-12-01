import { useEffect, useRef } from 'react';
import { loadSettings } from '@/lib/storage';
import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from '@/lib/platform';

export function useWaterReminders() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationTimeRef = useRef<number>(0);
  const permissionRequestedRef = useRef<boolean>(false);

  useEffect(() => {
    const requestPermissions = async () => {
      if (permissionRequestedRef.current) return;
      permissionRequestedRef.current = true;

      if (isNative()) {
        try {
          // Controlla se abbiamo i permessi
          const permStatus = await LocalNotifications.checkPermissions();
          console.log('Notification permission status:', permStatus.display);
          
          if (permStatus.display === 'prompt' || permStatus.display === 'prompt-with-rationale') {
            // Richiedi i permessi
            const result = await LocalNotifications.requestPermissions();
            console.log('Permission request result:', result.display);
          }
        } catch (error) {
          console.error('Error requesting notification permissions:', error);
        }
      } else {
        // Web: richiedi permessi notifiche browser
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const checkAndNotifyWater = async () => {
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

      lastNotificationTimeRef.current = now.getTime();

      // Send notification
      if (isNative()) {
        // Native notification
        try {
          const permStatus = await LocalNotifications.checkPermissions();
          
          if (permStatus.display === 'granted') {
            const notificationId = Math.floor(Math.random() * 2147483647);
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: '💧 Ricordati di bere!',
                  body: 'È ora di bere un bicchiere d\'acqua e stare idratato/a',
                  id: notificationId,
                  schedule: { at: new Date(Date.now() + 1000) },
                  sound: undefined,
                  attachments: undefined,
                  actionTypeId: "",
                  extra: null
                }
              ]
            });
            console.log('Native notification scheduled');
          } else {
            console.log('Notification permission not granted:', permStatus.display);
          }
        } catch (error) {
          console.error('Error scheduling notification:', error);
        }
      } else {
        // Web notification
        if ('Notification' in window && Notification.permission === 'granted') {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'WATER_REMINDER',
              title: '💧 Ricordati di bere!',
              body: 'È ora di bere un bicchiere d\'acqua e stare idratato/a',
              tag: 'water-reminder',
            });
          } else {
            new Notification('💧 Ricordati di bere!', {
              body: 'È ora di bere un bicchiere d\'acqua e stare idratato/a',
              badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2322c55e"/><text x="50" y="55" font-size="60" font-weight="bold" fill="white" text-anchor="middle">💧</text></svg>',
              tag: 'water-reminder',
            });
          }
        }
      }
    };

    // Check every minute
    intervalRef.current = setInterval(checkAndNotifyWater, 60000);
    
    // Initial check after 5 seconds
    setTimeout(checkAndNotifyWater, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}

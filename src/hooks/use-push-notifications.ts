import { useEffect, useState } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { registerFCMToken } from "@/server/actions/notification-actions";
import { useIsMobile } from "./use-mobile";

export function usePushNotifications() {
  const isMobile = useIsMobile();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupPush = async () => {
      // Push notifications are only applicable for mobile apps
      if (!isMobile) return;

      try {
        // Request permission to use push notifications
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn("User denied push notification permissions");
          return;
        }

        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();

        // Listen for successful registration
        PushNotifications.addListener('registration', async (registrationInfo) => {
          if (!mounted) return;
          console.log('Push registration success, token: ' + registrationInfo.value);
          setToken(registrationInfo.value);
          // Register this device token with our backend
          await registerFCMToken(registrationInfo.value);
        });

        // Listen for registration error
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Listen for received push payloads while the app is in the foreground
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ' + JSON.stringify(notification));
          // Could dispatch a local toast here if desired, but NotificationBell handles visual UI
        });

        // Listen for clicks on the push notification banner
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
          const url = notification.notification.data?.url;
          if (url) {
            window.location.href = url; // or router.push(url)
          }
        });

      } catch (e) {
        console.error("Push Notifications Setup Failed:", e);
      }
    };

    setupPush();

    return () => {
      mounted = false;
      if (isMobile) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [isMobile]);

  return { token };
}

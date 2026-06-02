// hooks/useNotificationDeepLinks.ts — wire push-notification taps to navigation.
//
// Three entry paths are covered:
//   1. Foreground — setNotificationHandler shows the banner while the app is open.
//   2. Warm tap   — addNotificationResponseReceivedListener fires when the user
//                   taps a notification with the app running/backgrounded.
//   3. Cold start — getLastNotificationResponseAsync returns the tap that
//                   launched the app from a killed state.
//
// Each path pulls `data.deep_link` off the notification and hands it to
// routeDeepLink (services/deepLinks.ts), which navigates once the tree is ready.

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { routeDeepLink } from '../services/deepLinks';

// Show notifications even when the app is in the foreground (SDK 55 API:
// shouldShowBanner / shouldShowList replace the deprecated shouldShowAlert).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function linkFrom(response: Notifications.NotificationResponse | null): string | null {
  const link = response?.notification.request.content.data?.deep_link;
  return typeof link === 'string' ? link : null;
}

export function useNotificationDeepLinks(): void {
  useEffect(() => {
    let cancelled = false;

    // Cold start — app launched by tapping a push.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (cancelled) return;
      routeDeepLink(linkFrom(response));
    });

    // Warm — tapped while running or backgrounded.
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      routeDeepLink(linkFrom(response));
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
}

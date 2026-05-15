// In Expo Go (SDK 53+) expo-notifications crashes on import because its
// auto-registration side-effect tries to register an Android push token,
// which Expo Go no longer supports. To keep the app loading we hard-disable
// notifications here. The in-app rest timer still works — you just won't
// get a push when the timer ends.
//
// When you build a real dev client (`npx expo run:android` or EAS Build),
// swap this file's implementation for the real `expo-notifications` calls.

export function setupNotifications(): void {
  // no-op in Expo Go
}

export async function scheduleLocalNotification(_title: string, _body: string): Promise<void> {
  // no-op in Expo Go
}

export const notificationsAvailable = false;

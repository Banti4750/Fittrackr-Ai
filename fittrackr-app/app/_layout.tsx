import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/useAuthStore';
import { setupNotifications } from '../src/utils/notifications';
import { darkColors } from '../src/theme/colors';
import { SplashScreen } from '../src/components/SplashScreen';

setupNotifications();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const MIN_SPLASH_MS = 1600;

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { user, hydrate } = useAuthStore();
  const [bootDone, setBootDone] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setBootDone(true));
    const t = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!bootDone) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) router.replace('/(auth)');
    if (user && inAuthGroup) router.replace('/(tabs)/home');
  }, [bootDone, user, segments]);

  const splashVisible = !(bootDone && minTimeElapsed);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {!splashGone && (
        <SplashScreen visible={splashVisible} onFadedOut={() => setSplashGone(true)} />
      )}
    </View>
  );
}

export default function RootLayout() {
  const headerScreenOptions = {
    headerShown: true as const,
    headerStyle: { backgroundColor: darkColors.bg },
    headerTintColor: darkColors.text,
    headerTitleStyle: { color: darkColors.text, fontWeight: '700' as const },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: darkColors.bg },
  };
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: darkColors.bg }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: darkColors.bg },
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="insights" options={{ ...headerScreenOptions, title: 'AI Insights' }} />
              <Stack.Screen name="bodystats" options={{ ...headerScreenOptions, title: 'Body Stats' }} />
              <Stack.Screen name="streaks" options={{ ...headerScreenOptions, title: 'Streaks' }} />
              <Stack.Screen name="workout/active" options={{ ...headerScreenOptions, title: 'Active Workout' }} />
              <Stack.Screen name="workout/[id]" options={{ ...headerScreenOptions, title: 'Workout' }} />
              <Stack.Screen name="exercise/[id]" options={{ ...headerScreenOptions, title: 'Exercise' }} />
            </Stack>
          </AuthGate>
          <StatusBar style="light" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

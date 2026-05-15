import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '../src/stores/useAuthStore';
import { setupNotifications } from '../src/utils/notifications';

setupNotifications();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { user, hydrated, hydrate } = useAuthStore();
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setBootDone(true));
  }, []);

  useEffect(() => {
    if (!bootDone) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) router.replace('/(auth)');
    if (user && inAuthGroup) router.replace('/(tabs)/home');
  }, [bootDone, user, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="insights" options={{ headerShown: true, title: 'AI Insights' }} />
              <Stack.Screen name="bodystats" options={{ headerShown: true, title: 'Body Stats' }} />
              <Stack.Screen name="streaks" options={{ headerShown: true, title: 'Streaks' }} />
              <Stack.Screen name="workout/active" options={{ headerShown: true, title: 'Active Workout' }} />
              <Stack.Screen name="workout/[id]" options={{ headerShown: true, title: 'Workout' }} />
              <Stack.Screen name="exercise/[id]" options={{ headerShown: true, title: 'Exercise' }} />
            </Stack>
          </AuthGate>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

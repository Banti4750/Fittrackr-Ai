import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/useAuthStore';

export default function Index() {
  const { user, hydrated } = useAuthStore();

  // While auth is still hydrating, render nothing — the SplashScreen layered
  // by _layout.tsx is covering everything, so this won't flash.
  if (!hydrated) return null;

  return <Redirect href={user ? '/(tabs)/home' : '/(auth)'} />;
}

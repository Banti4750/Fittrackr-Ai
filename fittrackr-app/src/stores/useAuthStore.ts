import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { User } from '../types';
import * as authApi from '../api/auth';
import { setAuthToken } from '../api/client';

const USER_CACHE_KEY = 'fittrackr.user';

async function cacheUser(user: User | null): Promise<void> {
  if (user) await SecureStore.setItemAsync(USER_CACHE_KEY, JSON.stringify(user));
  else await SecureStore.deleteItemAsync(USER_CACHE_KEY);
}

async function readCachedUser(): Promise<User | null> {
  const raw = await SecureStore.getItemAsync(USER_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    level?: User['level'];
  }) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,

  setUser: (user) => {
    cacheUser(user);
    set({ user });
  },

  signIn: async (email, password) => {
    const { user, token } = await authApi.login(email, password);
    await setAuthToken(token);
    await cacheUser(user);
    set({ user, token });
  },

  signUp: async (input) => {
    const { user, token } = await authApi.register(input);
    await setAuthToken(token);
    await cacheUser(user);
    set({ user, token });
  },

  signOut: async () => {
    await setAuthToken(null);
    await cacheUser(null);
    set({ user: null, token: null });
  },

  hydrate: async () => {
    const cached = await readCachedUser();
    if (cached) {
      // Show the cached user immediately so the UI doesn't bounce through
      // the welcome screen while we wait for the network.
      set({ user: cached, hydrated: true });
    } else {
      set({ hydrated: true });
    }

    // Verify with the server in the background. If the token is invalid,
    // sign the user out; otherwise refresh the cached profile.
    try {
      const fresh = await authApi.me();
      await cacheUser(fresh);
      set({ user: fresh });
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 401 || status === 403) {
        await setAuthToken(null);
        await cacheUser(null);
        set({ user: null, token: null });
      }
      // For network/timeout errors, keep the cached user — they can still
      // use the app offline-first and we'll retry on the next launch.
    }
  },
}));

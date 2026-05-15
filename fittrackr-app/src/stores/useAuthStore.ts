import { create } from 'zustand';
import { User } from '../types';
import * as authApi from '../api/auth';
import { setAuthToken } from '../api/client';

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

  setUser: (user) => set({ user }),

  signIn: async (email, password) => {
    const { user, token } = await authApi.login(email, password);
    await setAuthToken(token);
    set({ user, token });
  },

  signUp: async (input) => {
    const { user, token } = await authApi.register(input);
    await setAuthToken(token);
    set({ user, token });
  },

  signOut: async () => {
    await setAuthToken(null);
    set({ user: null, token: null });
  },

  hydrate: async () => {
    try {
      const user = await authApi.me();
      set({ user, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));

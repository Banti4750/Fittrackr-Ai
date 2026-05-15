import { create } from 'zustand';

interface UIState {
  loading: boolean;
  setLoading: (b: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  setLoading: (b) => set({ loading: b }),
}));

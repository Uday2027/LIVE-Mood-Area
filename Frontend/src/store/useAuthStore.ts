// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/api/auth';

type AuthStore = {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user:  null,
      setAuth: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user });
      },
      clearAuth: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
    }),
    { name: 'moodmap_auth' },
  ),
);

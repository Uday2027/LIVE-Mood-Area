// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/api/auth';

type AuthStore = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (payload: { token: string; user: AuthUser }) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user:  null,
      isAuthenticated: false,
      setAuth: ({ token, user }) => {
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      },
      updateUser: (partial) => {
        const existing = get().user;
        if (existing) set({ user: { ...existing, ...partial } });
      },
    }),
    { name: 'moodmap_auth' },
  ),
);

// src/api/auth.ts
import api from './client';

export type MoodDistEntry = { mood: string; count: number };
export type PinHistoryEntry = { mood: string; createdAt: string };
export type BadgeEntry = { badgeType: string; earnedAt: string };

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  reputationScore: number;
  totalPins: number;
  isGhost?: boolean;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  badges?: BadgeEntry[];
  pinHistory?: PinHistoryEntry[];
  moodDistribution?: MoodDistEntry[];
};

export type AuthResponse = { token: string; user: AuthUser };

export const register = (data: { username: string; email: string; password: string }): Promise<AuthResponse> =>
  api.post('/auth/register', data);

export const login = (data: { email: string; password: string }): Promise<AuthResponse> =>
  api.post('/auth/login', data);

export const getMe = (): Promise<AuthUser> =>
  api.get('/auth/me');

export const getMyPins = (): Promise<unknown[]> =>
  api.get('/users/me/pins');

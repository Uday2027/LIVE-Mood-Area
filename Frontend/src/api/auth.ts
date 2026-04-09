// src/api/auth.ts
import api from './client';

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  reputationScore: number;
  createdAt: string;
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

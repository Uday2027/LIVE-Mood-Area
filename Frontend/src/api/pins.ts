// src/api/pins.ts
import api from './client';
import type { Mood } from '@/utils/moodColors';

export type Pin = {
  id: string;
  mood: Mood;
  message: string | null;
  latitude: number;
  longitude: number;
  credibilityScore: number;
  sessionId: string;
  userId: string | null;
  neighborhoodId: string | null;
  expiresAt: string;
  createdAt: string;
  voteCount: number;
};

export type CreatePinPayload = {
  mood: Mood;
  message?: string;
  latitude: number;
  longitude: number;
};

export const getPins = (): Promise<Pin[]> =>
  api.get('/pins/active');

export const createPin = (data: CreatePinPayload): Promise<Pin> =>
  api.post('/pins', data);

export const votePin = (id: string, vote: 'CONFIRM' | 'DISPUTE'): Promise<{ credibilityScore: number }> =>
  api.post(`/pins/${id}/vote`, { vote });

export const getPinVotes = (id: string): Promise<{ CONFIRM: number; DISPUTE: number }> =>
  api.get(`/pins/${id}/votes`);

export const deletePin = (id: string): Promise<void> =>
  api.delete(`/pins/${id}`);

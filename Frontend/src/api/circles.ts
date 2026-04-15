// src/api/circles.ts
import api from './client';
import type { Mood } from '@/utils/moodColors';

export type CircleStatus = 'ACTIVE' | 'DISSOLVED';

export type Circle = {
  id: string;
  neighborhoodId: string | null;
  mood: Mood;
  name: string;
  latitude: number;
  longitude: number;
  status: CircleStatus;
  memberCount: number;
  createdAt: string;
  dissolvesAt: string;
};

export type CircleMessage = {
  id: string;
  circleId: string;
  sessionId: string;
  userId: string | null;
  content: string;
  createdAt: string;
};

export const getActiveCircles = (latitude: number, longitude: number): Promise<Circle[]> =>
  api.get('/circles', { params: { latitude, longitude } });

export const getCircleById = (id: string): Promise<Circle> =>
  api.get(`/circles/${id}`);

export const getCircleMessages = (id: string, limit?: number, before?: string): Promise<CircleMessage[]> =>
  api.get(`/circles/${id}/messages`, { params: { limit, before } });

export const joinCircle = (id: string): Promise<{ circle: Circle; messages: CircleMessage[] }> =>
  api.post(`/circles/${id}/join`);

export const leaveCircle = (id: string): Promise<{ message: string }> =>
  api.post(`/circles/${id}/leave`);

// src/api/matches.ts
import api from './client';
import type { Mood } from '@/utils/moodColors';

export type MatchStatus = 'PENDING' | 'CONNECTED' | 'DECLINED' | 'EXPIRED';

export type Match = {
  id: string;
  initiatorId: string;
  targetId: string;
  initiatorMood: Mood;
  targetMood: Mood;
  distanceMeters: number;
  status: MatchStatus;
  matchedAt: string;
  respondedAt: string | null;
  expiresAt: string;
};

export type NearbyMatchSummary = {
  totalNearby: number;
  byMood: { mood: Mood; count: number }[];
};

export const getNearbyMatches = (latitude: number, longitude: number): Promise<NearbyMatchSummary> =>
  api.get('/matches/nearby', { params: { latitude, longitude } });

export const getUserMatches = (status?: MatchStatus): Promise<Match[]> =>
  api.get('/matches', { params: { status } });

export const respondToMatch = (id: string, accept: boolean): Promise<{ match: Match; circle?: any }> =>
  api.post(`/matches/${id}/${accept ? 'accept' : 'decline'}`);

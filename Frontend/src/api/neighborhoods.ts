// src/api/neighborhoods.ts
import api from './client';

export type Neighborhood = {
  id: string;
  name: string;
  city: string;
  boundary?: any; // GeoJSON Polygon
  mood?: MoodSummary;
};

export type MoodSummary = {
  neighborhoodId: string;
  dominantMood: string | null;
  moodScore: number;
  pinCount: number;
};

export type MoodSnapshot = {
  id: string;
  dominantMood: string | null;
  moodScore: number;
  pinCount: number;
  recordedAt: string;
};

export const getNeighborhoods = (): Promise<Neighborhood[]> =>
  api.get('/neighborhoods');

export const getNeighborhoodMood = (id: string): Promise<MoodSummary> =>
  api.get(`/neighborhoods/${id}/mood`);

export const getNeighborhoodHistory = (id: string): Promise<MoodSnapshot[]> =>
  api.get(`/neighborhoods/${id}/history`);

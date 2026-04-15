// src/api/stories.ts
import api from './client';
import type { Mood } from '@/utils/moodColors';

export type Story = {
  id: string;
  userId: string;
  neighborhoodId: string;
  mood: Mood;
  content: string;
  imageUrl?: string;
  viewsCount: number;
  expiresAt: string;
  createdAt: string;
};

export const getNeighborhoodStories = async (neighborhoodId: string): Promise<Story[]> => {
  return await api.get(`/neighborhoods/${neighborhoodId}/stories`);
};

export const createStory = async (data: { neighborhoodId: string; mood: Mood; content: string }): Promise<Story> => {
  return await api.post('/stories', data);
};

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
  const result = await api.get('/stories', { params: { neighborhoodId } });
  return Array.isArray(result) ? result : [];
};

export const createStory = async (data: { neighborhoodId: string; mood: Mood; content: string; imageUrl?: string }): Promise<Story> => {
  return await api.post('/stories', data);
};

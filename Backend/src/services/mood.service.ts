// server/src/services/mood.service.ts
// Neighborhood mood scoring — calculates dominant mood weighted by credibility.

import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { withCache } from '../utils/cache.js';
import type { Mood } from '@prisma/client';

type MoodScore = {
  neighborhoodId: string;
  dominantMood:   Mood | null;
  moodScore:      number;
  pinCount:       number;
  breakdown:      Record<string, number>;
};

export const getNeighborhoodMood = async (neighborhoodId: string): Promise<MoodScore> => {
  const latestSnapshot = await prisma.moodSnapshot.findFirst({
    where: { neighborhoodId },
    orderBy: { recordedAt: 'desc' },
  });

  if (!latestSnapshot) {
    return { 
      neighborhoodId, 
      dominantMood: null, 
      moodScore:    0, 
      pinCount:     0, 
      breakdown:    {} 
    };
  }

  // Note: Breakdown is not stored in snapshots in v1, 
  // we could potentially add it to snapshots if needed for the UI.
  return {
    neighborhoodId,
    dominantMood: latestSnapshot.dominantMood,
    moodScore:    latestSnapshot.moodScore,
    pinCount:     latestSnapshot.pinCount,
    breakdown:    {}, // Optional: populate if schema changes to include JSON breakdown
  };
};

export const getMoodHistory = async (
  neighborhoodId: string,
  hours = 24,
): Promise<unknown[]> => {
  const since = new Date(Date.now() - hours * 60 * 60 * 1_000);

  const neighborhood = await prisma.neighborhood.findUnique({
    where: { id: neighborhoodId },
    select: { id: true },
  });

  if (neighborhood === null) throw new AppError('Neighborhood not found', 404);

  return prisma.moodSnapshot.findMany({
    where: { neighborhoodId, recordedAt: { gte: since } },
    orderBy: { recordedAt: 'asc' },
    select: {
      id: true, dominantMood: true,
      moodScore: true, pinCount: true, recordedAt: true,
    },
  });
};

export const getAllNeighborhoods = async (): Promise<unknown[]> =>
  withCache('moodmap:neighborhoods', 60, () =>
    prisma.neighborhood.findMany({
      select: { id: true, name: true, city: true, boundary: true },
    })
  );

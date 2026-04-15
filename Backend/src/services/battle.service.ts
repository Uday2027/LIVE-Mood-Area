// server/src/services/battle.service.ts
// Logic for neighborhood battles — scoring zones and tracking leaderboards.

import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

/**
 * Get the current active battle and its leaderboard.
 */
export const getCurrentBattle = async () => {
  const battle = await prisma.neighborhoodBattle.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: {
      scores: {
        include: { neighborhood: { select: { name: true } } },
        orderBy: { score: 'desc' },
      },
    },
  });

  if (!battle) throw new AppError('No active battle found', 404);
  return battle;
};

/**
 * Update scores for the active battle.
 * Score is calculated based on active pins in each neighborhood.
 */
export const updateBattleScores = async () => {
  const battle = await prisma.neighborhoodBattle.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (!battle) return;

  const neighborhoods = await prisma.neighborhood.findMany({ select: { id: true } });

  for (const n of neighborhoods) {
    // Score = Sum of credibility of all active pins in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const stats = await prisma.moodPin.aggregate({
      where: {
        neighborhoodId: n.id,
        createdAt: { gte: oneHourAgo },
      },
      _sum: { credibilityScore: true },
    });

    const hourlyScore = stats._sum.credibilityScore ?? 0;

    await prisma.battleScore.upsert({
      where: { 
        battleId_neighborhoodId: { 
          battleId: battle.id, 
          neighborhoodId: n.id 
        } 
      },
      update: { score: { increment: hourlyScore } },
      create: { 
        battleId: battle.id, 
        neighborhoodId: n.id, 
        score: hourlyScore 
      },
    });
  }
};

/**
 * Create a new battle.
 */
export const createBattle = async (title: string, durationDays = 7) => {
  // Complete existing battles
  await prisma.neighborhoodBattle.updateMany({
    where: { status: 'ACTIVE' },
    data: { status: 'COMPLETED' },
  });

  const now = new Date();
  const end = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  return prisma.neighborhoodBattle.create({
    data: {
      title,
      startTime: now,
      endTime: end,
      status: 'ACTIVE',
    },
  });
};

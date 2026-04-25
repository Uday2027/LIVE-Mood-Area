// server/src/jobs/questJob.ts
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { Mood } from '@prisma/client';

export const runQuestJob = async () => {
  logger.info('[QuestJob] Generating new daily quest...');
  
  await prisma.dailyQuest.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });

  const moods = Object.values(Mood);
  const targetMood = moods[Math.floor(Math.random() * moods.length)] ?? null;
  const count = Math.floor(Math.random() * 5) + 3; // 3 to 7

  const newQuest = await prisma.dailyQuest.create({
    data: {
      questType: 'FIND_VIBE',
      description: `Find or drop ${count} ${targetMood ?? 'mood'} pins today!`,
      ...(targetMood !== null ? { targetMood } : {}),
      targetCount: count,
      createdDate: new Date(),
      isActive: true
    }
  });

  logger.info(`[QuestJob] Created new quest: ${newQuest.description}`);
};

export const startQuestJob = (): NodeJS.Timeout => {
  runQuestJob().catch((err: unknown) => {
    logger.error('Quest job failed on startup', { err });
  });

  return setInterval(() => {
    runQuestJob().catch((err: unknown) => {
      logger.error('Quest job failed', { err });
    });
  }, 24 * 60 * 60 * 1000);
};

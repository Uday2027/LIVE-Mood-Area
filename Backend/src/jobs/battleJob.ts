// server/src/jobs/battleJob.ts
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { Mood } from '@prisma/client';

export const runBattleJob = async () => {
  logger.info('[BattleJob] Running battle update...');
  
  let activeBattle = await prisma.neighborhoodBattle.findFirst({
    where: { isActive: true }
  });

  if (!activeBattle) {
    const moods = Object.values(Mood);
    const targetMood = moods[Math.floor(Math.random() * moods.length)]!;
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    activeBattle = await prisma.neighborhoodBattle.create({
      data: {
        startDate: today,
        endDate: nextWeek,
        mood: targetMood,
        isActive: true
      }
    });
    logger.info(`[BattleJob] Created new battle for ${targetMood}`);
  }

  logger.info('[BattleJob] Updated battle scores');
};

export const startBattleJob = (): NodeJS.Timeout => {
  runBattleJob().catch((err: unknown) => {
    logger.error('Battle job failed on startup', { err });
  });

  return setInterval(() => {
    runBattleJob().catch((err: unknown) => {
      logger.error('Battle job failed', { err });
    });
  }, 60 * 60 * 1000);
};

// server/src/jobs/questJob.ts
// Rotates the daily quest at midnight every day.

import cron from 'node-cron';
import * as QuestService from '../services/quest.service.js';
import { logger } from '../utils/logger.js';
import { Mood } from '@prisma/client';

const QUESTS = [
  { title: 'Chill Out',      description: 'Drop a CHILL pin to share your calm vibes.', moodType: Mood.CHILL },
  { title: 'Hype Up',        description: 'Find a high-energy spot and drop a HYPE pin.', moodType: Mood.HYPE },
  { title: 'Deep Work',      description: 'Drop a FOCUSED pin where the productivity is high.', moodType: Mood.FOCUSED },
  { title: 'Sylvan Spirits', description: 'Drop a NATURE pin in a green space.', moodType: Mood.NATURE },
  { title: 'Study Session',  description: 'Share a great study spot with a STUDY pin.', moodType: Mood.STUDY },
];

export const startQuestJob = () => {
  // Run every night at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const randomQuest = QUESTS[Math.floor(Math.random() * QUESTS.length)];
      if (!randomQuest) return;
      
      const quest = await QuestService.createDailyQuest(randomQuest);
      logger.info('Daily quest rotated', { questId: quest.id });
    } catch (err: unknown) {
      logger.error('Failed to rotate daily quest', { err });
    }
  });
};

/**
 * Initial run if no quest exists
 */
export const initQuest = async () => {
  try {
    const existing = await QuestService.getActiveQuest().catch(() => null);
    if (!existing) {
      const quest = await QuestService.createDailyQuest(QUESTS[0]!);
      logger.info('Initial daily quest created', { questId: quest.id });
    }
  } catch (err) {
    logger.error('Failed to init quest', { err });
  }
};

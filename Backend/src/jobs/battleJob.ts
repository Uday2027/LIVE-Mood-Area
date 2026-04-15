// server/src/jobs/battleJob.ts
// Handles periodic battle scoring and weekly resolution.

import cron from 'node-cron';
import * as BattleService from '../services/battle.service.js';
import { logger } from '../utils/logger.js';

export const startBattleJob = () => {
  // 1. Update scores every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await BattleService.updateBattleScores();
      logger.debug('Battle scores updated hourly');
    } catch (err) {
      logger.error('Failed to update battle scores', { err });
    }
  });

  // 2. Resolve and start new battle every Monday at midnight
  cron.schedule('0 0 * * 1', async () => {
    try {
      const weekNumber = Math.ceil(new Date().getDate() / 7);
      const title = `Vibe Battle: Week ${weekNumber}`;
      const battle = await BattleService.createBattle(title);
      logger.info('New weekly battle started', { battleId: battle.id });
    } catch (err) {
      logger.error('Failed to rotate weekly battle', { err });
    }
  });
};

/**
 * Initial run if no battle exists
 */
export const initBattle = async () => {
  try {
    const existing = await BattleService.getCurrentBattle().catch(() => null);
    if (!existing) {
      const battle = await BattleService.createBattle('Inaugural Vibe Battle');
      logger.info('Initial battle started', { battleId: battle.id });
    }
  } catch (err) {
    logger.error('Failed to init battle', { err });
  }
};

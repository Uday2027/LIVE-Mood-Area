// server/src/jobs/index.ts
// Starts all background jobs after server boot.

import type { Server } from 'socket.io';
import { startSnapshotJob } from './snapshotJob.js';
import { startExpireJob }   from './expireJob.js';
import { startMatchJob }    from './matchJob.js';
import { startCircleJob }   from './circleJob.js';
import { startQuestJob }    from './questJob.js';
import { startBattleJob }   from './battleJob.js';
import { startDiaryJob }    from './diaryJob.js';
import { logger }           from '../utils/logger.js';

export const startJobs = (io: Server): void => {
  startSnapshotJob(io);
  startExpireJob(io);
  startMatchJob(io);
  startCircleJob(io);
  startQuestJob();
  startBattleJob();
  startDiaryJob();
  logger.info('Background jobs started (snapshot, expire, match, circle, quest, battle, diary)');
};

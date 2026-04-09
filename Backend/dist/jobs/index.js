// server/src/jobs/index.ts
// Starts all background jobs after server boot.
import { startSnapshotJob } from './snapshotJob.js';
import { startExpireJob } from './expireJob.js';
import { logger } from '../utils/logger.js';
export const startJobs = (io) => {
    startSnapshotJob(io);
    startExpireJob(io);
    logger.info('Background jobs started (snapshot: 30s, expire: 5min)');
};
//# sourceMappingURL=index.js.map
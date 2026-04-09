// server/src/jobs/expireJob.ts
// Removes expired pins from the database every 5 minutes.
// Emits pin_expired events for each removed pin so maps update immediately.

import type { Server } from 'socket.io';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

const INTERVAL_MS = 5 * 60_000;

const expirePins = async (io: Server): Promise<void> => {
  const expired = await prisma.moodPin.findMany({
    where:  { expiresAt: { lte: new Date() } },
    select: { id: true },
  });

  if (expired.length === 0) return;

  await prisma.moodPin.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });

  for (const pin of expired) {
    io.emit('pin_expired', { pinId: pin.id });
  }

  logger.info(`Expired and removed ${expired.length} pins`);
};

export const startExpireJob = (io: Server): NodeJS.Timeout =>
  setInterval(() => {
    expirePins(io).catch((err: unknown) => {
      logger.error('Expire job failed', { err });
    });
  }, INTERVAL_MS);

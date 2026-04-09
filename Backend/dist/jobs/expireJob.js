// server/src/jobs/expireJob.ts
// Removes expired pins from the database every 5 minutes.
// Emits pin_expired events for each removed pin so maps update immediately.
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
const INTERVAL_MS = 5 * 60_000;
const expirePins = async (io) => {
    const expired = await prisma.moodPin.findMany({
        where: { expiresAt: { lte: new Date() } },
        select: { id: true },
    });
    if (expired.length === 0)
        return;
    await prisma.moodPin.deleteMany({
        where: { expiresAt: { lte: new Date() } },
    });
    for (const pin of expired) {
        io.emit('pin_expired', { pinId: pin.id });
    }
    logger.info(`Expired and removed ${expired.length} pins`);
};
export const startExpireJob = (io) => setInterval(() => {
    expirePins(io).catch((err) => {
        logger.error('Expire job failed', { err });
    });
}, INTERVAL_MS);
//# sourceMappingURL=expireJob.js.map
// server/src/jobs/snapshotJob.ts
// Writes a MoodSnapshot for every neighborhood every 30 seconds.
// Emits mood_update socket event so clients recolor the heatmap in real time.
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
const INTERVAL_MS = 30_000;
const snapshot = async (io) => {
    const neighborhoods = await prisma.neighborhood.findMany({
        select: { id: true },
    });
    for (const n of neighborhoods) {
        const groups = await prisma.moodPin.groupBy({
            by: ['mood'],
            where: { neighborhoodId: n.id, expiresAt: { gt: new Date() } },
            _sum: { credibilityScore: true },
            orderBy: { _sum: { credibilityScore: 'desc' } },
        });
        const topGroup = groups[0];
        const dominantMood = topGroup?.mood ?? null;
        const moodScore = topGroup?._sum.credibilityScore ?? 0;
        const pinCount = groups.reduce((acc, g) => acc + (g._sum.credibilityScore ?? 0), 0);
        await prisma.moodSnapshot.create({
            data: { neighborhoodId: n.id, dominantMood, moodScore, pinCount },
        });
        io.emit('mood_update', { neighborhoodId: n.id, mood: dominantMood, score: moodScore });
    }
    logger.debug(`Mood snapshot written for ${neighborhoods.length} neighborhoods`);
};
export const startSnapshotJob = (io) => setInterval(() => {
    snapshot(io).catch((err) => {
        logger.error('Snapshot job failed', { err });
    });
}, INTERVAL_MS);
//# sourceMappingURL=snapshotJob.js.map
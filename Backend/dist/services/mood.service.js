// server/src/services/mood.service.ts
// Neighborhood mood scoring — calculates dominant mood weighted by credibility.
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
export const getNeighborhoodMood = async (neighborhoodId) => {
    const neighborhood = await prisma.neighborhood.findUnique({
        where: { id: neighborhoodId },
        select: { id: true },
    });
    if (neighborhood === null)
        throw new AppError('Neighborhood not found', 404);
    const groups = await prisma.moodPin.groupBy({
        by: ['mood'],
        where: { neighborhoodId, expiresAt: { gt: new Date() } },
        _sum: { credibilityScore: true },
        orderBy: { _sum: { credibilityScore: 'desc' } },
    });
    if (groups.length === 0) {
        return { neighborhoodId, dominantMood: null, moodScore: 0, pinCount: 0, breakdown: {} };
    }
    const pinCount = groups.reduce((acc, g) => acc + (g._sum.credibilityScore ?? 0), 0);
    const breakdown = Object.fromEntries(groups.map((g) => [g.mood, g._sum.credibilityScore ?? 0]));
    const topGroup = groups[0];
    const dominantMood = topGroup?.mood ?? null;
    const moodScore = topGroup?._sum.credibilityScore ?? 0;
    return { neighborhoodId, dominantMood, moodScore, pinCount, breakdown };
};
export const getMoodHistory = async (neighborhoodId, hours = 24) => {
    const since = new Date(Date.now() - hours * 60 * 60 * 1_000);
    const neighborhood = await prisma.neighborhood.findUnique({
        where: { id: neighborhoodId },
        select: { id: true },
    });
    if (neighborhood === null)
        throw new AppError('Neighborhood not found', 404);
    return prisma.moodSnapshot.findMany({
        where: { neighborhoodId, recordedAt: { gte: since } },
        orderBy: { recordedAt: 'asc' },
        select: {
            id: true, dominantMood: true,
            moodScore: true, pinCount: true, recordedAt: true,
        },
    });
};
export const getAllNeighborhoods = async () => prisma.neighborhood.findMany({
    select: { id: true, name: true, city: true, boundary: true },
});
//# sourceMappingURL=mood.service.js.map
import type { Mood } from '@prisma/client';
type MoodScore = {
    neighborhoodId: string;
    dominantMood: Mood | null;
    moodScore: number;
    pinCount: number;
    breakdown: Record<string, number>;
};
export declare const getNeighborhoodMood: (neighborhoodId: string) => Promise<MoodScore>;
export declare const getMoodHistory: (neighborhoodId: string, hours?: number) => Promise<unknown[]>;
export declare const getAllNeighborhoods: () => Promise<unknown[]>;
export {};
//# sourceMappingURL=mood.service.d.ts.map
// server/src/services/waitlist.service.ts
// Waitlist logic — handles signups, referral tracking, and position ranking.

import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { withCache, invalidateCache } from '../utils/cache.js';
import { nanoid } from 'nanoid';

export type WaitlistStats = {
  totalSignups: number;
  byCity: { city: string; count: number }[];
};

export type WaitlistResult = {
  position: number;
  referralCode: string;
  totalAhead: number;
};

/**
 * Join the waitlist and handle referral logic.
 */
export const joinWaitlist = async (data: {
  email: string;
  city: string;
  referralCode?: string;
}): Promise<WaitlistResult> => {
  const existing = await prisma.waitlist.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    return getWaitlistPosition(existing.email);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Handle referrer if provided
    if (data.referralCode) {
      await tx.waitlist.update({
        where: { referralCode: data.referralCode },
        data: { referralCount: { increment: 1 } },
      }).catch(() => {
        // Ignore invalid referral codes
      });
    }

    // 2. Initial position is just total count + 1
    const totalCount = await tx.waitlist.count();
    
    // 3. Create entry
    const entry = await tx.waitlist.create({
      data: {
        email: data.email,
        city: data.city,
        referralCode: nanoid(10), // Short unique readable code
        referredBy: data.referralCode,
        position: totalCount + 1,
      },
    });

    await invalidateCache('moodmap:waitlist:stats');

    return calculatePosition(entry.id);
  });
};

/**
 * Get current stats for the waitlist page.
 */
export const getWaitlistStats = async (): Promise<WaitlistStats> => {
  return withCache('moodmap:waitlist:stats', 120, async () => {
    const [totalSignups, cityGroups] = await Promise.all([
      prisma.waitlist.count(),
      prisma.waitlist.groupBy({
        by: ['city'],
        _count: { _all: true },
        orderBy: { _count: { city: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      totalSignups,
      byCity: cityGroups.map((g) => ({ city: g.city, count: g._count._all })),
    };
  });
};

/**
 * Calculate the weighted position of a user.
 * Higher referral counts jump the queue.
 * Within same referral count, join time (createdAt) determines rank.
 */
async function calculatePosition(id: string): Promise<WaitlistResult> {
  const user = await prisma.waitlist.findUnique({ where: { id } });
  if (!user) throw new AppError('Waitlist entry not found', 404);

  // Use a query to count how many people are "ahead"
  // Ahead means: (referralCount > user.referralCount) 
  // OR (referralCount == user.referralCount AND joinedAt < user.joinedAt)
  const aheadCount = await prisma.waitlist.count({
    where: {
      OR: [
        { referralCount: { gt: user.referralCount } },
        {
          AND: [
            { referralCount: user.referralCount },
            { joinedAt: { lt: user.joinedAt } },
          ],
        },
      ],
    },
  });

  const position = aheadCount + 1;

  // Update cached position in DB for quick reads (optional, but requested in schema)
  await prisma.waitlist.update({
    where: { id },
    data: { position },
  });

  return {
    position,
    referralCode: user.referralCode,
    totalAhead: aheadCount,
  };
}

async function getWaitlistPosition(email: string): Promise<WaitlistResult> {
  const user = await prisma.waitlist.findUnique({ where: { email } });
  if (!user) throw new AppError('Waitlist entry not found', 404);
  return calculatePosition(user.id);
}

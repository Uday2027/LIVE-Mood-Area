// server/src/services/votes.service.ts
// Credibility score recalculation after each vote.

import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

const AUTO_REMOVE_THRESHOLD = 3; // dispute:confirm ratio that triggers removal

export const recalculateCredibility = async (pinId: string): Promise<number> => {
  const groups = await prisma.pinVote.groupBy({
    by: ['vote'],
    where: { pinId },
    _count: { vote: true },
  });

  const confirms = groups.find((g) => g.vote === 'CONFIRM')?._count.vote ?? 0;
  const disputes = groups.find((g) => g.vote === 'DISPUTE')?._count.vote ?? 0;

  const credibility = confirms + disputes === 0
    ? 0.5
    : confirms / (confirms + disputes);

  await prisma.moodPin.update({
    where: { id: pinId },
    data:  { credibilityScore: credibility },
  });

  // Auto-remove pins disputed far more than they are confirmed
  if (disputes > 0 && disputes / Math.max(confirms, 1) >= AUTO_REMOVE_THRESHOLD) {
    await prisma.moodPin.delete({ where: { id: pinId } });
    return -1; // Signal to caller that pin was removed
  }

  return credibility;
};

type CastVoteParams = {
  pinId:     string;
  sessionId: string;
  vote:      'CONFIRM' | 'DISPUTE';
};

export const castVote = async (params: CastVoteParams): Promise<{ credibilityScore: number; removed: boolean }> => {
  const { pinId, sessionId, vote } = params;

  const pin = await prisma.moodPin.findFirst({
    where: { id: pinId, expiresAt: { gt: new Date() } },
    select: { id: true, sessionId: true, expiresAt: true },
  });

  if (pin === null) throw new AppError('Pin not found or has expired', 404);
  if (pin.sessionId === sessionId) throw new AppError('You cannot vote on your own pin', 403);

  try {
    await prisma.pinVote.create({ data: { pinId, sessionId, vote } });
    
    if (vote === 'CONFIRM') {
      const newExp = new Date(pin.expiresAt.getTime() + 30 * 60 * 1000);
      await prisma.moodPin.update({ where: { id: pinId }, data: { expiresAt: newExp }});
    }
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new AppError('You have already voted on this pin', 409);
    }
    throw err;
  }

  const credibilityScore = await recalculateCredibility(pinId);
  const removed = credibilityScore === -1;

  return { credibilityScore: removed ? 0 : credibilityScore, removed };
};

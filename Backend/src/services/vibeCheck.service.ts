// server/src/services/vibeCheck.service.ts
// Logic for two-way mood checks — allows users to see each other's moods privately.

import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import type { Mood } from '@prisma/client';

export const sendVibeCheck = async (data: {
  senderId:   string;
  receiverId: string;
  senderMood: Mood;
}) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return prisma.vibeCheck.create({
    data: {
      ...data,
      expiresAt,
    },
  });
};

export const respondToVibeCheck = async (
  checkId:      string,
  receiverId:   string,
  receiverMood: Mood,
  status:       'ACCEPTED' | 'DECLINED'
) => {
  const check = await prisma.vibeCheck.findUnique({
    where: { id: checkId },
  });

  if (!check) throw new AppError('Vibe check not found', 404);
  if (check.receiverId !== receiverId) throw new AppError('Unauthorized', 403);
  if (check.expiresAt < new Date()) throw new AppError('Vibe check expired', 410);

  return prisma.vibeCheck.update({
    where: { id: checkId },
    data: {
      receiverMood: status === 'ACCEPTED' ? receiverMood : null,
      status:       status as any, // enum cast
    },
  });
};

export const getPendingChecks = async (receiverId: string) => {
  return prisma.vibeCheck.findMany({
    where: {
      receiverId,
      status: 'PENDING',
      expiresAt: { gt: new Date() },
    },
    include: {
      sender: { select: { username: true, avatarUrl: true } },
    },
  });
};

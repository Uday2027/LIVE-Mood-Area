import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { Mood } from '@prisma/client';

export const sendVibeCheck = async (senderId: string, receiverId: string) => {
  if (senderId === receiverId) throw new AppError('Cannot vibe check yourself', 400);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const check = await prisma.vibeCheck.create({
    data: {
      senderId,
      receiverId,
      expiresAt
    }
  });
  return check;
};

export const respondVibeCheck = async (checkId: string, receiverId: string, mood: Mood) => {
  const check = await prisma.vibeCheck.findUnique({ where: { id: checkId } });
  if (!check) throw new AppError('Vibe check not found', 404);
  if (check.receiverId !== receiverId) throw new AppError('Unauthorized', 403);
  if (check.respondedAt) throw new AppError('Already responded', 400);

  const updated = await prisma.vibeCheck.update({
    where: { id: checkId },
    data: {
      receiverMood: mood,
      respondedAt: new Date()
    }
  });

  return updated;
};

export const getPendingChecks = async (userId: string) => {
  const checks = await prisma.vibeCheck.findMany({
    where: {
      receiverId: userId,
      respondedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { sender: { select: { username: true, avatarUrl: true } } }
  });
  return checks;
};

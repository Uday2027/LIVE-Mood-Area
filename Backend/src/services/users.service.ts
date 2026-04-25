import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      isGhost: true,
      totalPins: true,
      reputationScore: true,
      createdAt: true,
      badges: true,
      _count: { select: { pins: true, circleMembers: true } }
    }
  });

  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateProfile = async (userId: string, data: { bio?: string; avatarUrl?: string }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
    },
    select: {
      id: true,
      username: true,
      bio: true,
      avatarUrl: true
    }
  });
  return user;
};

export const toggleGhostMode = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isGhost: !user.isGhost },
    select: { isGhost: true }
  });
  return { isGhost: updatedUser.isGhost };
};

export const getUserPins = async (userId: string, cursor?: string) => {
  const limit = 20;
  const pins = await prisma.moodPin.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { _count: { select: { votes: true } } }
  });

  let nextCursor: string | undefined = undefined;
  if (pins.length > limit) {
    const nextItem = pins.pop();
    nextCursor = nextItem!.id;
  }

  return { pins, nextCursor };
};

export const getUserMoodHistory = async (userId: string) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const pins = await prisma.moodPin.groupBy({
    by: ['mood'],
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo }
    },
    _count: { mood: true }
  });

  return pins;
};

export const getUserDiary = async (userId: string) => {
  const diary = await prisma.moodDiary.findFirst({
    where: { userId },
    orderBy: { weekStart: 'desc' }
  });
  return diary;
};

export const getPublicProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      totalPins: true,
      createdAt: true,
      badges: { select: { badgeType: true, earnedAt: true } }
    }
  });

  if (!user) throw new AppError('User not found', 404);
  return user;
};

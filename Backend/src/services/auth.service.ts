// server/src/services/auth.service.ts
// All business logic for user registration and login. DB calls live here — not in controllers.

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import type { RegisterBody, LoginBody } from '../validators/auth.validator.js';

const SALT_ROUNDS = 12;

const USER_PUBLIC_SELECT = {
  id: true, username: true, email: true, reputationScore: true,
  totalPins: true, isGhost: true, avatarUrl: true, bio: true, createdAt: true,
} as const;

type PinHistoryItem = {
  mood: string;
  createdAt: Date;
};

type BadgeItem = {
  badgeType: string;
  earnedAt: Date;
};

type PublicUser = {
  id: string;
  username: string;
  email: string;
  reputationScore: number;
  totalPins: number;
  isGhost: boolean;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
};

export const register = async (data: RegisterBody): Promise<{ token: string; user: unknown }> => {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await (async (): Promise<PublicUser> => {
    try {
      return (await prisma.user.create({
        data: { username: data.username, email: data.email, passwordHash },
        select: USER_PUBLIC_SELECT,
      })) as PublicUser;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new AppError('Email or username already in use', 409);
      }
      throw err;
    }
  })();

  const token = signToken(user.id, user.email, user.username);
  return { token, user };
};

export const login = async (data: LoginBody): Promise<{ token: string; user: unknown }> => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { ...USER_PUBLIC_SELECT, passwordHash: true },
  });

  if (user === null) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken(user.id, user.email, user.username);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _omit, ...publicUser } = user;
  return { token, user: publicUser };
};

export const getProfile = async (userId: string): Promise<unknown> => {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: USER_PUBLIC_SELECT,
  });

  if (user === null) throw new AppError('User not found', 404);

  const [badges, pinHistory, moodCounts, neighborhoodCounts] = await Promise.all([
    prisma.userBadge.findMany({
      where:   { userId },
      select:  { badgeType: true, earnedAt: true },
      orderBy: { earnedAt: 'desc' },
    }),
    prisma.moodPin.findMany({
      where:   { userId },
      select:  { mood: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take:    90,
    }),
    prisma.moodPin.groupBy({
      by:    ['mood'],
      where: { userId },
      _count: { mood: true },
    }),
    prisma.moodPin.groupBy({
      by:    ['neighborhoodId'],
      where: { userId, neighborhoodId: { not: null } },
    }),
  ]);

  const moodDistribution = moodCounts.map((m) => ({ mood: m.mood, count: m._count.mood }));
  const dominantMood = moodDistribution.length > 0 
    ? moodDistribution.reduce((prev, current) => (prev.count > current.count) ? prev : current).mood 
    : null;

  return {
    ...user,
    badges: badges as BadgeItem[],
    pinHistory: pinHistory as PinHistoryItem[],
    moodDistribution,
    dominantMood,
    neighborhoodsVisited: neighborhoodCounts.length,
  };
};

const signToken = (id: string, email: string, username: string): string =>
  jwt.sign({ id, email, username }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as never,
  });

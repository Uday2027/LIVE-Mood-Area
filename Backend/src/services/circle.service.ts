// server/src/services/circle.service.ts
import { prisma } from '../config/database.js';
import { haversineDistance } from '../utils/geo.js';
import { AppError } from '../utils/AppError.js';
import { CircleStatus } from '@prisma/client';

export const getActiveCircles = async (latitude: number, longitude: number, radiusMeters = 5000) => {
  const circles = await prisma.vibeCircle.findMany({
    where: {
      status: CircleStatus.ACTIVE,
      dissolvesAt: { gt: new Date() },
    },
    include: {
      _count: { select: { members: true } },
    },
  });

  return circles.filter((c) => {
    const dist = haversineDistance(latitude, longitude, c.latitude, c.longitude) * 1000;
    return dist <= radiusMeters;
  });
};

export const getCircleMessages = async (circleId: string, sessionId: string, limit = 50, beforeId?: string) => {
  const circle = await prisma.vibeCircle.findUnique({
    where: { id: circleId },
  });
  if (!circle) throw new AppError('Circle not found', 404);

  const isMember = await prisma.circleMember.findUnique({
    where: { circleId_sessionId: { circleId, sessionId } },
  });
  if (!isMember) throw new AppError('Not a member of this circle', 403);

  return prisma.circleMessage.findMany({
    where: { circleId },
    take: limit,
    skip: beforeId ? 1 : 0,
    ...(beforeId ? { cursor: { id: beforeId } } : {}),
    orderBy: { createdAt: 'desc' },
  });
};

export const joinCircle = async (circleId: string, sessionId: string, userId?: string | null) => {
  const circle = await prisma.vibeCircle.findUnique({
    where: { id: circleId },
  });
  if (!circle || circle.status === CircleStatus.DISSOLVED || circle.dissolvesAt < new Date()) {
    throw new AppError('Circle not available', 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.circleMember.upsert({
      where: { circleId_sessionId: { circleId, sessionId } },
      update: { lastSeen: new Date() },
      create: { circleId, sessionId, userId: userId ?? null },
    });

    const memberCount = await tx.circleMember.count({ where: { circleId } });
    await tx.vibeCircle.update({
      where: { id: circleId },
      data: { memberCount },
    });
  });

  const updatedCircle = await prisma.vibeCircle.findUnique({ where: { id: circleId } });
  const messages = await getCircleMessages(circleId, sessionId, 50);

  return { circle: updatedCircle, messages };
};

export const leaveCircle = async (circleId: string, sessionId: string) => {
  await prisma.$transaction(async (tx) => {
    await tx.circleMember.deleteMany({
      where: { circleId, sessionId },
    });

    const memberCount = await tx.circleMember.count({ where: { circleId } });
    
    if (memberCount === 0) {
      await tx.vibeCircle.update({
        where: { id: circleId },
        data: { memberCount, status: CircleStatus.DISSOLVED },
      });
    } else {
      await tx.vibeCircle.update({
        where: { id: circleId },
        data: { memberCount },
      });
    }
  });
};

export const getCircleById = async (circleId: string) => {
  const circle = await prisma.vibeCircle.findUnique({
    where: { id: circleId },
    include: {
      members: {
        select: { sessionId: true, joinedAt: true, lastSeen: true, userId: true },
      },
    },
  });
  if (!circle) throw new AppError('Circle not found', 404);
  return circle;
};

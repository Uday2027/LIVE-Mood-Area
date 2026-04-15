// server/src/services/ping.service.ts
import type { Server } from 'socket.io';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { Mood } from '@prisma/client';

export const sendPing = async (
  data: {
    senderSession: string;
    receiverSession: string;
    mood: Mood;
    latitude: number;
    longitude: number;
  },
  io: Server
) => {
  if (data.senderSession === data.receiverSession) {
    throw new AppError('Cannot ping yourself', 400);
  }

  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  const recentPing = await prisma.proximityPing.findFirst({
    where: {
      senderSession: data.senderSession,
      receiverSession: data.receiverSession,
      sentAt: { gte: tenMinsAgo },
    },
  });

  if (recentPing) {
    throw new AppError('Already pinged this user recently', 429);
  }

  const ping = await prisma.proximityPing.create({
    data: {
      ...data,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  io.to(`session:${data.receiverSession}`).emit('proximity_ping', { ping });

  return ping;
};

export const getPendingPings = async (sessionId: string) => {
  return prisma.proximityPing.findMany({
    where: {
      receiverSession: sessionId,
      seen: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { sentAt: 'desc' },
  });
};

export const markPingSeen = async (pingId: string, sessionId: string) => {
  const ping = await prisma.proximityPing.findUnique({ where: { id: pingId } });
  
  if (!ping) throw new AppError('Ping not found', 404);
  if (ping.receiverSession !== sessionId) throw new AppError('Unauthorized', 403);

  return prisma.proximityPing.update({
    where: { id: pingId },
    data: { seen: true },
  });
};

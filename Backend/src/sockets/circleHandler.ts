// server/src/sockets/circleHandler.ts
import type { Server, Socket } from 'socket.io';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

const messageRateLimits = new Map<string, number[]>();

export const circleHandler = (io: Server, socket: Socket) => {
  const sessionId = socket.handshake.auth?.sessionId as string;

  socket.on('join_circle', async ({ circleId }) => {
    try {
      await prisma.circleMember.upsert({
        where: {
          circleId_sessionId: {
            circleId,
            sessionId,
          },
        },
        update: { lastSeen: new Date() },
        create: {
          circleId,
          sessionId,
        },
      });

      // socket.join takes string
      const roomStr = String(circleId); // usually UUID is string
      await socket.join(`circle:${roomStr}`);

      const memberCount = await prisma.circleMember.count({ where: { circleId } });

      await prisma.vibeCircle.update({
        where: { id: circleId },
        data: { memberCount },
      });

      io.to(`circle:${roomStr}`).emit('circle_member_count', { circleId, count: memberCount });
    } catch (err) {
      logger.error('Error joining circle', { err, circleId });
    }
  });

  socket.on('leave_circle', async ({ circleId }) => {
    try {
      await prisma.circleMember.deleteMany({ // deleteMany to not throw if missing
        where: {
          circleId,
          sessionId,
        },
      });

      const roomStr = String(circleId);
      await socket.leave(`circle:${roomStr}`);

      const memberCount = await prisma.circleMember.count({ where: { circleId } });

      await prisma.vibeCircle.update({
        where: { id: circleId },
        data: { memberCount },
      });

      io.to(`circle:${roomStr}`).emit('circle_member_count', { circleId, count: memberCount });
    } catch (err) {
      logger.error('Error leaving circle', { err, circleId });
    }
  });

  socket.on('circle_message', async ({ circleId, content }) => {
    try {
      if (!content || content.length > 300) return;

      // Rate limit: max 2 messages per 5 seconds per session
      const now = Date.now();
      const userKey = `${sessionId}:${circleId}`;
      let timestamps = messageRateLimits.get(userKey) || [];
      timestamps = timestamps.filter((t) => now - t < 5000);
      
      if (timestamps.length >= 2) return; // rate limited

      timestamps.push(now);
      messageRateLimits.set(userKey, timestamps);

      const msg = await prisma.circleMessage.create({
        data: {
          circleId,
          sessionId,
          content,
        },
      });

      const roomStr = String(circleId);
      io.to(`circle:${roomStr}`).emit('circle_message', msg);
    } catch (err) {
      logger.error('Error sending circle message', { err, circleId });
    }
  });
};

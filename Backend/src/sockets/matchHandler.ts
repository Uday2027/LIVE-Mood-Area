// server/src/sockets/matchHandler.ts
import type { Server, Socket } from 'socket.io';
import { prisma } from '../config/database.js';
import { MatchStatus, CircleStatus } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const matchHandler = (io: Server, socket: Socket) => {
  const sessionId = socket.handshake.auth?.sessionId as string;

  socket.on('accept_match', async ({ matchId }) => {
    try {
      const match = await prisma.vibeMatch.findUnique({ where: { id: matchId } });
      if (!match) return;

      // Ensure that only the target can accept initially, or initiator if pending logic allows
      if (match.targetId !== sessionId) return; 

      if (match.status !== MatchStatus.PENDING) return;

      if (new Date() > match.expiresAt) {
        await prisma.vibeMatch.update({ where: { id: matchId }, data: { status: MatchStatus.EXPIRED } });
        return;
      }

      await prisma.vibeMatch.update({
        where: { id: matchId },
        data: {
          status: MatchStatus.CONNECTED,
          respondedAt: new Date(),
        },
      });

      // Create a private vibe circle for the pair
      const capitalizedMood = match.targetMood.charAt(0).toUpperCase() + match.targetMood.slice(1).toLowerCase();
      
      // Get target's last pin to use as location
      const pin = await prisma.moodPin.findFirst({
        where: { sessionId: match.targetId },
        orderBy: { createdAt: 'desc' },
      });

      const circle = await prisma.vibeCircle.create({
        data: {
          mood: match.targetMood,
          name: `Private ${capitalizedMood} Circle`,
          status: CircleStatus.ACTIVE,
          latitude: pin?.latitude ?? 0,
          longitude: pin?.longitude ?? 0,
          memberCount: 2,
          dissolvesAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
      });

      io.to(`session:${match.initiatorId}`).to(`session:${match.targetId}`).emit('match_accepted', {
        matchId,
        circleId: circle.id,
      });

      // We cannot easily force the connected client to socket.join from the server side if they are on different servers, 
      // but since it's a single instance we can find their sockets, or let the client join upon receiving 'match_accepted'.
      // Sockets standard way: the client will call join_circle when it receives match_accepted
    } catch (err) {
      logger.error('Error accepting match', { err, matchId });
    }
  });

  socket.on('decline_match', async ({ matchId }) => {
    try {
      const match = await prisma.vibeMatch.findUnique({ where: { id: matchId } });
      if (!match || match.targetId !== sessionId) return;
      if (match.status !== MatchStatus.PENDING) return;

      await prisma.vibeMatch.update({
        where: { id: matchId },
        data: {
          status: MatchStatus.DECLINED,
          respondedAt: new Date(),
        },
      });

      io.to(`session:${match.initiatorId}`).emit('match_declined', { matchId });
    } catch (err) {
      logger.error('Error declining match', { err, matchId });
    }
  });
};

// server/src/jobs/matchJob.ts
import type { Server } from 'socket.io';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { haversineDistance } from '../utils/geo.js';
import { env } from '../config/env.js';
import { MatchStatus, Mood } from '@prisma/client';

const INTERVAL_MS = 60_000;

const matchUsers = async (io: Server): Promise<void> => {
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

  // Get active pins from last 10 minutes by non-ghost sessions
  const activePins = await prisma.moodPin.findMany({
    where: {
      createdAt: { gte: tenMinsAgo },
      expiresAt: { gt: new Date() },
      user: {
        isGhost: false, // only consider non-ghosts if logged in
      },
    },
    select: {
      id: true,
      sessionId: true,
      mood: true,
      latitude: true,
      longitude: true,
      userId: true,
    },
  });

  if (activePins.length < 2) return;

  // Group by session to only use the most recent pin for each session
  const latestPinBySession = new Map<string, typeof activePins[0]>();
  for (const pin of activePins) {
    latestPinBySession.set(pin.sessionId, pin);
  }

  const pinsToMatch = Array.from(latestPinBySession.values());

  if (pinsToMatch.length < 2) return;

  let matchesCreated = 0;

  for (let i = 0; i < pinsToMatch.length; i++) {
    for (let j = i + 1; j < pinsToMatch.length; j++) {
      const p1 = pinsToMatch[i]!;
      const p2 = pinsToMatch[j]!;

      if (p1.mood !== p2.mood) continue;

      const distKm = haversineDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
      const distMeters = distKm * 1000;

      if (distMeters <= env.MATCH_RADIUS_METERS) {
        // Check if existing pending match between these two sessions
        const existingMatch = await prisma.vibeMatch.findFirst({
          where: {
            status: MatchStatus.PENDING,
            expiresAt: { gt: new Date() },
            OR: [
              { initiatorId: p1.sessionId, targetId: p2.sessionId },
              { initiatorId: p2.sessionId, targetId: p1.sessionId },
            ],
          },
        });

        if (!existingMatch) {
          const match = await prisma.vibeMatch.create({
            data: {
              initiatorId: p1.sessionId,
              targetId: p2.sessionId,
              initiatorMood: p1.mood,
              targetMood: p2.mood,
              distanceMeters: Math.round(distMeters),
              status: MatchStatus.PENDING,
              expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
            },
          });

          // Emit to both
          io.to(`session:${p1.sessionId}`).to(`session:${p2.sessionId}`).emit('vibe_match_found', { match });
          matchesCreated++;
        }
      }
    }
  }

  if (matchesCreated > 0) {
    logger.debug(`Match job created ${matchesCreated} new vibe matches.`);
  }
};

export const startMatchJob = (io: Server): NodeJS.Timeout =>
  setInterval(() => {
    matchUsers(io).catch((err: unknown) => {
      logger.error('Match job failed', { err });
    });
  }, INTERVAL_MS);

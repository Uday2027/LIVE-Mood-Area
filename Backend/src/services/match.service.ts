// server/src/services/match.service.ts
import { prisma } from '../config/database.js';
import { haversineDistance } from '../utils/geo.js';
import { AppError } from '../utils/AppError.js';
import { MatchStatus, CircleStatus, Mood } from '@prisma/client';

export const getNearbyVibeMatches = async (
  sessionId: string,
  latitude: number,
  longitude: number,
  radiusMeters = 2000,
) => {
  const allActivePins = await prisma.moodPin.findMany({
    where: {
      expiresAt: { gt: new Date() },
      sessionId: { not: sessionId },
      user: {
        isGhost: false,
      },
    },
    select: {
      id: true,
      sessionId: true,
      mood: true,
      latitude: true,
      longitude: true,
    },
  });

  const nearbyPins = allActivePins.filter((pin) => {
    const dist = haversineDistance(latitude, longitude, pin.latitude, pin.longitude) * 1000;
    return dist <= radiusMeters;
  });

  const moodCounts = new Map<Mood, number>();
  for (const pin of nearbyPins) {
    moodCounts.set(pin.mood, (moodCounts.get(pin.mood) || 0) + 1);
  }

  const byMood = Array.from(moodCounts.entries()).map(([mood, count]) => ({ mood, count }));

  return {
    totalNearby: nearbyPins.length,
    byMood,
  };
};

export const respondToMatch = async (matchId: string, sessionId: string, accept: boolean) => {
  const match = await prisma.vibeMatch.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError('Match not found', 404);
  if (match.targetId !== sessionId) throw new AppError('Unauthorized', 403);

  if (new Date() > match.expiresAt) throw new AppError('Match expired', 410);
  if (match.status !== MatchStatus.PENDING) throw new AppError('Match already responded to', 400);

  const updatedMatch = await prisma.vibeMatch.update({
    where: { id: matchId },
    data: {
      status: accept ? MatchStatus.CONNECTED : MatchStatus.DECLINED,
      respondedAt: new Date(),
    },
  });

  if (accept) {
    // Usually circle creation is handled via socket but prompt requires it here too. Or just from socket is enough?
    // "If CONNECTED: create vibe_circle for the pair"
    const capitalizedMood = match.targetMood.charAt(0).toUpperCase() + match.targetMood.slice(1).toLowerCase();
    
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

    return { match: updatedMatch, circle };
  }

  return { match: updatedMatch };
};

export const getUserMatches = async (sessionId: string, status?: MatchStatus) => {
  return prisma.vibeMatch.findMany({
    where: {
      OR: [{ initiatorId: sessionId }, { targetId: sessionId }],
      ...(status ? { status } : {}),
      expiresAt: { gt: new Date() },
    },
    orderBy: { matchedAt: 'desc' },
  });
};

// server/src/services/pins.service.ts
// All business logic for mood pins. All DB access lives here.

import type { Server } from 'socket.io';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { isPointInPolygon, haversineDistance } from '../utils/geo.js';
import type { CreatePinBody } from '../validators/pin.validator.js';

const PIN_LIFETIME_MS = 2 * 60 * 60 * 1_000; // 2 hours

const ACTIVE_PIN_SELECT = {
  id: true,
  mood: true,
  message: true,
  imageUrl: true,
  latitude: true,
  longitude: true,
  credibilityScore: true,
  createdAt: true,
  expiresAt: true,
  neighborhoodId: true,
  _count: { select: { votes: true } },
} as const;

export const getActivePins = async (): Promise<unknown[]> =>
  prisma.moodPin.findMany({
    where:  { expiresAt: { gt: new Date() } },
    select: ACTIVE_PIN_SELECT,
  });

type CreatePinInput = CreatePinBody & {
  sessionId: string;
  userId:    string | null;
};

export const createPin = async (
  data: CreatePinInput,
  io: Server,
): Promise<unknown> => {
  if (!data.ignoreCollision) {
    const activePins = await prisma.moodPin.findMany({
      where: { expiresAt: { gt: new Date() } },
    });

    for (const p of activePins) {
      const distanceKm = haversineDistance(data.latitude, data.longitude, p.latitude, p.longitude);
      if (distanceKm <= 0.05) {
        throw new AppError(JSON.stringify({
          message: 'There is already a pin here.',
          collidedPin: p,
        }), 409);
      }
    }
  }

  const neighborhood = await resolveNeighborhood(data.latitude, data.longitude);
  const expiresAt    = new Date(Date.now() + PIN_LIFETIME_MS);

  const pin = await prisma.moodPin.create({
    data: {
      mood:            data.mood,
      message:         data.message ?? null,
      imageUrl:        data.imageUrl ?? null,
      latitude:        data.latitude,
      longitude:       data.longitude,
      sessionId:       data.sessionId,
      userId:          data.userId,
      neighborhoodId:  neighborhood?.id ?? null,
      expiresAt,
    },
    select: ACTIVE_PIN_SELECT,
  });

  io.emit('new_pin', { pin });
  return pin;
};

export const getPinVotes = async (pinId: string): Promise<unknown> => {
  const pin = await prisma.moodPin.findUnique({
    where:  { id: pinId },
    select: {
      id: true,
      _count: { select: { votes: true } },
      votes: {
        select: { vote: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  });

  if (pin === null) throw new AppError('Pin not found', 404);
  return pin;
};

export const deletePin = async (
  pinId:     string,
  sessionId: string | null,
  userId:    string | undefined,
): Promise<void> => {
  const pin = await prisma.moodPin.findUnique({
    where:  { id: pinId },
    select: { id: true, sessionId: true, userId: true },
  });

  if (pin === null) throw new AppError('Pin not found', 404);

  const isOwner =
    (userId !== undefined && pin.userId === userId) ||
    (sessionId !== null && pin.sessionId === sessionId);

  if (!isOwner) throw new AppError('You can only delete your own pins', 403);

  await prisma.moodPin.delete({ where: { id: pinId } });
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const resolveNeighborhood = async (lat: number, lng: number): Promise<{ id: string, boundary: unknown } | null> => {
  const neighborhoods = await prisma.neighborhood.findMany({
    select: { id: true, boundary: true },
  });

  return neighborhoods.find((n) =>
    isPointInPolygon(lat, lng, n.boundary as Parameters<typeof isPointInPolygon>[2]),
  ) ?? null;
};

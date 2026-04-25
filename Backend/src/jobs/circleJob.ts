// server/src/jobs/circleJob.ts
import type { Server } from 'socket.io';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { CircleStatus, Mood } from '@prisma/client';

const INTERVAL_MS = 120_000;

const processCircles = async (io: Server): Promise<void> => {
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Use raw query for efficient grouping by neighborhood and mood because Prisma's groupBy 
  // requires neighborhoodId to be non-null and filtering by count > threshold is easier via HAVING.
  // We'll perform grouped aggregate using Prisma.
  
  const groupedPins = await prisma.moodPin.groupBy({
    by: ['neighborhoodId', 'mood'],
    where: {
      createdAt: { gte: thirtyMinsAgo },
      expiresAt: { gt: new Date() },
      neighborhoodId: { not: null },
    },
    _count: {
      id: true,
    },
  });

  let newCirclesCount = 0;

  for (const group of groupedPins) {
    if (group._count.id >= env.CIRCLE_AUTO_THRESHOLD && group.neighborhoodId) {
      const neighborhood = await prisma.neighborhood.findUnique({
        where: { id: group.neighborhoodId },
      });

      if (!neighborhood) continue;

      const existingCircle = await prisma.vibeCircle.findFirst({
        where: {
          neighborhoodId: group.neighborhoodId,
          mood: group.mood,
          status: CircleStatus.ACTIVE,
          dissolvesAt: { gt: new Date() },
        },
      });

      if (!existingCircle) {
        // Calculate centroid of the pins in this neighborhood (approximation)
        const pins = await prisma.moodPin.findMany({
          where: { neighborhoodId: group.neighborhoodId, mood: group.mood, createdAt: { gte: thirtyMinsAgo } },
          select: { latitude: true, longitude: true },
        });

        const latSum = pins.reduce((sum, p) => sum + p.latitude, 0);
        const lonSum = pins.reduce((sum, p) => sum + p.longitude, 0);
        const latitude = latSum / pins.length;
        const longitude = lonSum / pins.length;

        const capitalizedMood = group.mood.charAt(0).toUpperCase() + group.mood.slice(1).toLowerCase();
        
        const circle = await prisma.vibeCircle.create({
          data: {
            neighborhoodId: group.neighborhoodId,
            mood: group.mood,
            name: `${neighborhood.name} ${capitalizedMood} Circle`,
            latitude,
            longitude,
            status: CircleStatus.ACTIVE,
            memberCount: 0,
            dissolvesAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          },
        });

        io.emit('new_circle', { circle });
        newCirclesCount++;

        const eventPins = await prisma.moodPin.findMany({
          where: { neighborhoodId: group.neighborhoodId, mood: group.mood, createdAt: { gte: new Date(Date.now() - 20 * 60 * 1000) } },
        });

        if (eventPins.length >= env.EVENT_CLUSTER_THRESHOLD) {
           const existingEvent = await prisma.spontaneousEvent.findFirst({
             where: { neighborhoodId: group.neighborhoodId, mood: group.mood, isActive: true }
           });
           
           if (!existingEvent) {
             await prisma.spontaneousEvent.create({
               data: {
                 neighborhoodId: group.neighborhoodId,
                 mood: group.mood,
                 latitude,
                 longitude,
                 pinCount: eventPins.length,
                 circleId: circle.id,
                 isActive: true
               }
             });
             logger.info(`Spontaneous event created for ${group.mood} in neighborhood ${group.neighborhoodId}`);
           }
        }
      }
    }
  }

  // Update member_count for all active circles
  const activeCircles = await prisma.vibeCircle.findMany({
    where: { status: CircleStatus.ACTIVE },
    select: { id: true },
  });

  for (const c of activeCircles) {
    const memCount = await prisma.circleMember.count({
      where: { circleId: c.id },
    });
    
    await prisma.vibeCircle.update({
      where: { id: c.id },
      data: { memberCount: memCount },
    });
  }

  if (newCirclesCount > 0) {
    logger.debug(`Circle job created ${newCirclesCount} auto-circles.`);
  }
};

export const startCircleJob = (io: Server): NodeJS.Timeout =>
  setInterval(() => {
    processCircles(io).catch((err: unknown) => {
      logger.error('Circle job failed', { err });
    });
  }, INTERVAL_MS);

import { prisma } from '../config/database.js';
import { haversineDistance } from '../utils/geo.js';

export const getNearbyEvents = async (lat: number, lng: number) => {
  const events = await prisma.spontaneousEvent.findMany({
    where: { isActive: true },
    include: { neighborhood: true, circle: true }
  });

  const nearby = events.filter(e => haversineDistance(lat, lng, e.latitude, e.longitude) <= 5000);
  return nearby;
};

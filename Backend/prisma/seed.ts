// server/prisma/seed.ts
// Seeds Dhaka neighborhood zones. Run with: bun db:seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type NeighborhoodSeed = {
  id:       string;
  name:     string;
  city:     string;
  boundary: {
    type:        'Polygon';
    coordinates: Array<Array<[number, number]>>;
  };
};

const NEIGHBORHOODS: NeighborhoodSeed[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Dhanmondi',
    city: 'Dhaka',
    boundary: {
      type: 'Polygon',
      coordinates: [[[90.3650, 23.7430], [90.3800, 23.7430], [90.3800, 23.7570], [90.3650, 23.7570], [90.3650, 23.7430]]],
    },
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Gulshan',
    city: 'Dhaka',
    boundary: {
      type: 'Polygon',
      coordinates: [[[90.4100, 23.7820], [90.4300, 23.7820], [90.4300, 23.7980], [90.4100, 23.7980], [90.4100, 23.7820]]],
    },
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Banani',
    city: 'Dhaka',
    boundary: {
      type: 'Polygon',
      coordinates: [[[90.4000, 23.7900], [90.4150, 23.7900], [90.4150, 23.8020], [90.4000, 23.8020], [90.4000, 23.7900]]],
    },
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Mirpur',
    city: 'Dhaka',
    boundary: {
      type: 'Polygon',
      coordinates: [[[90.3500, 23.7900], [90.3750, 23.7900], [90.3750, 23.8200], [90.3500, 23.8200], [90.3500, 23.7900]]],
    },
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Old Dhaka',
    city: 'Dhaka',
    boundary: {
      type: 'Polygon',
      coordinates: [[[90.3900, 23.7050], [90.4200, 23.7050], [90.4200, 23.7280], [90.3900, 23.7280], [90.3900, 23.7050]]],
    },
  },
];

async function seed(): Promise<void> {
  console.info('🌱 Seeding neighborhoods...');

  for (const neighborhood of NEIGHBORHOODS) {
    await prisma.neighborhood.upsert({
      where:  { id: neighborhood.id },
      update: {},
      create: neighborhood,
    });
  }

  console.info(`✅ Seeded ${NEIGHBORHOODS.length} neighborhoods.`);
}

seed()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

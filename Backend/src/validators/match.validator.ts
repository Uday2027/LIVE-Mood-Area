// server/src/validators/match.validator.ts
import { z } from 'zod';
import { MatchStatus } from '@prisma/client';

export const getNearbyMatchesSchema = z.object({
  query: z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  }),
});

export const respondMatchSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getMatchesSchema = z.object({
  query: z.object({
    status: z.nativeEnum(MatchStatus).optional(),
  }),
});

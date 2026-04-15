// server/src/validators/circle.validator.ts
import { z } from 'zod';

export const getActiveCirclesSchema = z.object({
  query: z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  }),
});

export const getCircleMessagesSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    limit: z.coerce.number().min(1).max(100).optional(),
    before: z.string().uuid().optional(),
  }),
});

export const circleIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

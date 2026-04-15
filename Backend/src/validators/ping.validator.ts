// server/src/validators/ping.validator.ts
import { z } from 'zod';
import { Mood } from '@prisma/client';

export const sendPingSchema = z.object({
  body: z.object({
    receiverSession: z.string().uuid(),
    mood: z.nativeEnum(Mood),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  }),
});

export const pingIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

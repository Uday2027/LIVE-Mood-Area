// server/src/validators/pin.validator.ts
// Zod schemas for all pin-related request validation.

import { z } from 'zod';

const MOOD_VALUES = ['CHILL', 'HYPE', 'FOCUSED', 'ROMANTIC', 'SKETCHY'] as const;
const VOTE_VALUES = ['CONFIRM', 'DISPUTE'] as const;

export const createPinSchema = z.object({
  body: z.object({
    mood:      z.enum(MOOD_VALUES),
    message:   z.string().max(100).optional(),
    imageUrl:  z.string().optional(),
    latitude:  z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    ignoreCollision: z.boolean().optional(),
  }),
});

export const voteSchema = z.object({
  body: z.object({
    vote: z.enum(VOTE_VALUES),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const pinIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreatePinBody   = z.infer<typeof createPinSchema>['body'];
export type VoteBody        = z.infer<typeof voteSchema>['body'];

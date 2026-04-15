// server/src/validators/story.validator.ts
import { z } from 'zod';
import { Mood } from '@prisma/client';

export const getStoriesSchema = z.object({
  query: z.object({
    neighborhoodId: z.string().uuid(), // ID uses uuid since schema is String @id @default(uuid())
  }),
});

export const createStorySchema = z.object({
  body: z.object({
    neighborhoodId: z.string().uuid(),
    mood: z.nativeEnum(Mood),
    content: z.string().max(200).optional(),
    imageUrl: z.string().url().optional(),
  }),
});

export const storyIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

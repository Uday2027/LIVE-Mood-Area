// server/src/routes/vibeChecks.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as VibeChecksController from '../controllers/vibeChecks.controller.js';
import { z } from 'zod';

const router = Router();

const sendSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid(),
    senderMood: z.enum(['CHILL', 'HYPE', 'FOCUSED', 'ROMANTIC', 'SKETCHY', 'NATURE', 'STUDY', 'FESTIVE', 'RELAXING']),
  }),
});

const respondSchema = z.object({
  body: z.object({
    mood:   z.enum(['CHILL', 'HYPE', 'FOCUSED', 'ROMANTIC', 'SKETCHY', 'NATURE', 'STUDY', 'FESTIVE', 'RELAXING']),
    status: z.enum(['ACCEPTED', 'DECLINED']),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

router.post('/',         requireAuth, validate(sendSchema),    VibeChecksController.sendCheck);
router.post('/:id/resp', requireAuth, validate(respondSchema), VibeChecksController.respond);
router.get('/pending',   requireAuth, VibeChecksController.getPending);

export default router;

// server/src/routes/push.ts
// Push notification routes — handles browser subscription objects.

import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import * as PushController from '../controllers/push.controller.js';
import { z } from 'zod';

const router = Router();

const subscribeSchema = z.object({
  body: z.object({
    subscription: z.object({
      endpoint: z.string().url(),
      keys: z.object({
        p256dh: z.string().min(1),
        auth:   z.string().min(1),
      }),
    }),
  }),
});

router.post('/subscribe', optionalAuth, validate(subscribeSchema), PushController.subscribe);

export default router;

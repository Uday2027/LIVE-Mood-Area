// server/src/routes/waitlist.ts
// Waitlist routes — public endpoints for early access signups.

import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import * as WaitlistController from '../controllers/waitlist.controller.js';
import { z } from 'zod';

const router = Router();

const joinSchema = z.object({
  body: z.object({
    email: z.string().email(),
    city:  z.string().min(2).max(100),
    referralCode: z.string().optional(),
  }),
});

router.post('/', validate(joinSchema), WaitlistController.joinWaitlist);
router.get('/stats', WaitlistController.getStats);

export default router;

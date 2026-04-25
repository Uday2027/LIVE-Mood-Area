import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as VibeChecksController from '../controllers/vibeChecks.controller.js';

const router = Router();
router.post('/', requireAuth, VibeChecksController.sendVibeCheck);
router.post('/:id/respond', requireAuth, VibeChecksController.respondVibeCheck);
router.get('/pending', requireAuth, VibeChecksController.getPendingChecks);
export default router;

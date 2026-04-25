import { Router } from 'express';
import * as WaitlistController from '../controllers/waitlist.controller.js';
import { cache } from '../middleware/cache.js';

const router = Router();

router.post('/', WaitlistController.joinWaitlist);
router.get('/stats', cache(120), WaitlistController.getWaitlistStats);

export default router;

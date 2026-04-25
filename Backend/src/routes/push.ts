import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware.js';
import * as PushController from '../controllers/push.controller.js';

const router = Router();
router.post('/subscribe', optionalAuth, PushController.subscribe);
export default router;

// server/src/routes/quests.ts
import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware.js';
import * as QuestsController from '../controllers/quests.controller.js';

const router = Router();
router.get('/today',       QuestsController.getTodayQuest);
router.get('/my-progress', optionalAuth, QuestsController.checkProgress);

export default router;

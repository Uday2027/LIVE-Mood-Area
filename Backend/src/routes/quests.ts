import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware.js';
import * as QuestsController from '../controllers/quests.controller.js';

const router = Router();
router.get('/today', QuestsController.getActiveQuest);
router.get('/:id/progress', optionalAuth, QuestsController.checkQuestCompletion);

export default router;

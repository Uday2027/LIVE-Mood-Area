import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as UsersController from '../controllers/users.controller.js';

const router = Router();

router.get('/me', requireAuth, UsersController.getProfile);
router.put('/me', requireAuth, UsersController.updateProfile);
router.post('/me/ghost', requireAuth, UsersController.toggleGhostMode);
router.get('/me/pins', requireAuth, UsersController.getUserPins);
router.get('/me/history', requireAuth, UsersController.getUserMoodHistory);
router.get('/me/diary', requireAuth, UsersController.getUserDiary);
router.get('/:id', UsersController.getPublicProfile);

export default router;

// server/src/routes/circles.ts
import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { getActiveCirclesSchema, getCircleMessagesSchema, circleIdParamSchema } from '../validators/circle.validator.js';
import * as CirclesController from '../controllers/circles.controller.js';

const router = Router();

router.get('/', validate(getActiveCirclesSchema), CirclesController.getActiveCircles);
router.get('/:id', validate(circleIdParamSchema), CirclesController.getCircleById);
router.get('/:id/messages', validate(getCircleMessagesSchema), CirclesController.getCircleMessages);
router.post('/:id/join', validate(circleIdParamSchema), CirclesController.joinCircle);
router.post('/:id/leave', validate(circleIdParamSchema), CirclesController.leaveCircle);

export default router;

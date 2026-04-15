// server/src/routes/pings.ts
import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { sendPingSchema, pingIdParamSchema } from '../validators/ping.validator.js';
import * as PingsController from '../controllers/pings.controller.js';
import { pingRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/', pingRateLimit, validate(sendPingSchema), PingsController.sendPing);
router.get('/pending', PingsController.getPendingPings);
router.post('/:id/seen', validate(pingIdParamSchema), PingsController.markPingSeen);

export default router;

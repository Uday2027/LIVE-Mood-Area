// server/src/routes/pins.ts
// Pin routes — wires middleware and controller per AGENT.md spec.
import { Router } from 'express';
import { pinRateLimit, voteRateLimit } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { createPinSchema, voteSchema, pinIdSchema } from '../validators/pin.validator.js';
import * as PinController from '../controllers/pins.controller.js';
const router = Router();
router.get('/active', PinController.getActivePins);
router.post('/', pinRateLimit, validate(createPinSchema), PinController.createPin);
router.post('/:id/vote', voteRateLimit, validate(voteSchema), PinController.voteOnPin);
router.get('/:id/votes', validate(pinIdSchema), PinController.getPinVotes);
router.delete('/:id', optionalAuth, validate(pinIdSchema), PinController.deletePin);
export default router;
//# sourceMappingURL=pins.js.map
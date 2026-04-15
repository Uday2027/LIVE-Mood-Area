// server/src/routes/matches.ts
import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { getNearbyMatchesSchema, respondMatchSchema, getMatchesSchema } from '../validators/match.validator.js';
import * as MatchesController from '../controllers/matches.controller.js';

const router = Router();

router.get('/nearby', validate(getNearbyMatchesSchema), MatchesController.getNearbyMatches);
router.get('/', validate(getMatchesSchema), MatchesController.getUserMatches);
router.post('/:id/accept', validate(respondMatchSchema), MatchesController.respondToMatch);
router.post('/:id/decline', validate(respondMatchSchema), MatchesController.respondToMatch);

export default router;

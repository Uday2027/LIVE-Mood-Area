// server/src/routes/neighborhoods.ts
// Neighborhood routes — all public, no auth required.

import { Router } from 'express';
import * as NeighborhoodController from '../controllers/neighborhoods.controller.js';
import { cache } from '../middleware/cache.js';

const router = Router();

router.get('/',               cache(60), NeighborhoodController.getAllNeighborhoods);
router.get('/:id/mood',       cache(30), NeighborhoodController.getNeighborhoodMood);
router.get('/:id/history',    cache(60), NeighborhoodController.getNeighborhoodHistory);

export default router;

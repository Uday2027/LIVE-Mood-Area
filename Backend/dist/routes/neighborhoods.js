// server/src/routes/neighborhoods.ts
// Neighborhood routes — all public, no auth required.
import { Router } from 'express';
import * as NeighborhoodController from '../controllers/neighborhoods.controller.js';
const router = Router();
router.get('/', NeighborhoodController.getAllNeighborhoods);
router.get('/:id/mood', NeighborhoodController.getNeighborhoodMood);
router.get('/:id/history', NeighborhoodController.getNeighborhoodHistory);
export default router;
//# sourceMappingURL=neighborhoods.js.map
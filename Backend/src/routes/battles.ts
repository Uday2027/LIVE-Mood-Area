// server/src/routes/battles.ts
import { Router } from 'express';
import * as BattlesController from '../controllers/battles.controller.js';

const router = Router();
router.get('/current', BattlesController.getCurrentBattle);

export default router;

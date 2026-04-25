import { Router } from 'express';
import * as BattlesController from '../controllers/battles.controller.js';

const router = Router();
router.get('/current', BattlesController.getCurrentBattle);
router.get('/history', BattlesController.getBattleHistory);

export default router;

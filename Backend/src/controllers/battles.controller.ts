// server/src/controllers/battles.controller.ts
import type { Request, Response } from 'express';
import * as BattleService from '../services/battle.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getCurrentBattle = catchAsync(async (_req: Request, res: Response) => {
  const battle = await BattleService.getCurrentBattle();
  success(res, battle);
});

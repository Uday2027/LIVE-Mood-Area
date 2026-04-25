import { Request, Response } from 'express';
import * as BattleService from '../services/battle.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getCurrentBattle = catchAsync(async (req: Request, res: Response) => {
  const battle = await BattleService.getCurrentBattle();
  success(res, battle);
});

export const getBattleHistory = catchAsync(async (req: Request, res: Response) => {
  const history = await BattleService.getBattleHistory();
  success(res, history);
});

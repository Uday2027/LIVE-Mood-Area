// server/src/controllers/waitlist.controller.ts
// HTTP layer for waitlist signups and statistics.

import type { Request, Response } from 'express';
import * as WaitlistService from '../services/waitlist.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const joinWaitlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WaitlistService.joinWaitlist(req.body);
  created(res, result);
});

export const getStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await WaitlistService.getWaitlistStats();
  success(res, stats);
});

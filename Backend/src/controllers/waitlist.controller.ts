import { Request, Response } from 'express';
import * as WaitlistService from '../services/waitlist.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const joinWaitlist = catchAsync(async (req: Request, res: Response) => {
  const entry = await WaitlistService.joinWaitlist(req.body);
  created(res, entry);
});

export const getWaitlistStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await WaitlistService.getWaitlistStats();
  success(res, stats);
});

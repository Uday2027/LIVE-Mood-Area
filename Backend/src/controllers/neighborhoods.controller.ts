// server/src/controllers/neighborhoods.controller.ts
// HTTP layer for neighborhood queries and mood reporting.

import type { Request, Response } from 'express';
import * as MoodService from '../services/mood.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAllNeighborhoods = catchAsync(async (_req: Request, res: Response) => {
  const neighborhoods = await MoodService.getAllNeighborhoods();
  success(res, neighborhoods);
});

export const getNeighborhoodMood = catchAsync(async (req: Request, res: Response) => {
  const mood = await MoodService.getNeighborhoodMood(req.params['id'] as string);
  success(res, mood);
});

export const getNeighborhoodHistory = catchAsync(async (req: Request, res: Response) => {
  const hours = req.query['hours'] !== undefined
    ? Number(req.query['hours'])
    : 24;

  const history = await MoodService.getMoodHistory(req.params['id'] as string, hours);
  success(res, history);
});

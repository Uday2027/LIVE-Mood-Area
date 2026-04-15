// server/src/controllers/matches.controller.ts
import * as MatchService from '../services/match.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';
import { MatchStatus } from '@prisma/client';

export const getNearbyMatches = catchAsync(async (req, res) => {
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  
  const result = await MatchService.getNearbyVibeMatches(req.sessionId!, latitude, longitude);
  success(res, result);
});

export const respondToMatch = catchAsync(async (req, res) => {
  const accept = req.path.endsWith('accept');
  const result = await MatchService.respondToMatch(req.params.id as string, req.sessionId!, accept);
  success(res, result);
});

export const getUserMatches = catchAsync(async (req, res) => {
  const status = req.query.status as MatchStatus | undefined;
  const result = await MatchService.getUserMatches(req.sessionId!, status);
  success(res, result);
});

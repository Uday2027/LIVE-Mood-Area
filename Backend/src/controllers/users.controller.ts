import { Request, Response } from 'express';
import * as UsersService from '../services/users.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await UsersService.getUserProfile(req.user!.id);
  success(res, user);
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await UsersService.updateProfile(req.user!.id, req.body);
  success(res, user);
});

export const toggleGhostMode = catchAsync(async (req: Request, res: Response) => {
  const result = await UsersService.toggleGhostMode(req.user!.id);
  success(res, result);
});

export const getUserPins = catchAsync(async (req: Request, res: Response) => {
  const cursor = req.query.cursor as string | undefined;
  const result = await UsersService.getUserPins(req.user!.id, cursor);
  success(res, result);
});

export const getUserMoodHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await UsersService.getUserMoodHistory(req.user!.id);
  success(res, result);
});

export const getUserDiary = catchAsync(async (req: Request, res: Response) => {
  const diary = await UsersService.getUserDiary(req.user!.id);
  success(res, diary);
});

export const getPublicProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await UsersService.getPublicProfile(String(req.params['id']));
  success(res, user);
});

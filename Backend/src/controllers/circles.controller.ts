// server/src/controllers/circles.controller.ts
import * as CircleService from '../services/circle.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getActiveCircles = catchAsync(async (req, res) => {
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);

  const circles = await CircleService.getActiveCircles(latitude, longitude);
  success(res, circles);
});

export const getCircleById = catchAsync(async (req, res) => {
  const circle = await CircleService.getCircleById(req.params.id as string);
  success(res, circle);
});

export const getCircleMessages = catchAsync(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const before = req.query.before as string | undefined;

  const messages = await CircleService.getCircleMessages(req.params.id as string, req.sessionId!, limit, before);
  success(res, messages);
});

export const joinCircle = catchAsync(async (req, res) => {
  const result = await CircleService.joinCircle(req.params.id as string, req.sessionId!, req.user?.id);
  success(res, result);
});

export const leaveCircle = catchAsync(async (req, res) => {
  await CircleService.leaveCircle(req.params.id as string, req.sessionId!);
  success(res, { message: 'Left circle successfully' });
});

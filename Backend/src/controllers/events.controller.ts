import { Request, Response } from 'express';
import * as EventService from '../services/event.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getNearbyEvents = catchAsync(async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  const events = await EventService.getNearbyEvents(Number(lat), Number(lng));
  success(res, events);
});

// server/src/controllers/pings.controller.ts
import * as PingService from '../services/ping.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const sendPing = catchAsync(async (req, res) => {
  const io = req.app.get('io');
  const ping = await PingService.sendPing(
    {
      ...req.body,
      senderSession: req.sessionId!,
    },
    io
  );
  created(res, ping);
});

export const getPendingPings = catchAsync(async (req, res) => {
  const pings = await PingService.getPendingPings(req.sessionId!);
  success(res, pings);
});

export const markPingSeen = catchAsync(async (req, res) => {
  const ping = await PingService.markPingSeen(req.params.id as string, req.sessionId!);
  success(res, ping);
});

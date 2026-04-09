// server/src/controllers/pins.controller.ts
// HTTP layer for pins — extracts validated data, calls service, returns response.

import type { Request, Response } from 'express';
import * as PinService from '../services/pins.service.js';
import * as VotesService from '../services/votes.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import type { Server } from 'socket.io';

// io is injected at route-mount time so controllers stay testable without sockets
let _io: Server;
export const setIo = (io: Server): void => { _io = io; };

export const getActivePins = catchAsync(async (_req: Request, res: Response) => {
  const pins = await PinService.getActivePins();
  success(res, pins);
});

export const createPin = catchAsync(async (req: Request, res: Response) => {
  if (req.sessionId === null) {
    throw new AppError('x-session-id header is required to drop a pin', 400);
  }

  const pin = await PinService.createPin(
    {
      ...req.body as Parameters<typeof PinService.createPin>[0],
      sessionId: req.sessionId,
      userId:    req.user?.id ?? null,
    },
    _io,
  );

  created(res, pin);
});

export const voteOnPin = catchAsync(async (req: Request, res: Response) => {
  if (req.sessionId === null) {
    throw new AppError('x-session-id header is required to vote', 400);
  }

  const result = await VotesService.castVote({
    pinId:     req.params['id'] as string,
    sessionId: req.sessionId,
    vote:      (req.body as { vote: 'CONFIRM' | 'DISPUTE' }).vote,
  });

  if (result.removed) {
    _io.emit('pin_removed', { pinId: req.params['id'] });
  } else {
    _io.emit('pin_credibility_update', {
      pinId:            req.params['id'],
      credibilityScore: result.credibilityScore,
    });
  }

  success(res, result);
});

export const getPinVotes = catchAsync(async (req: Request, res: Response) => {
  const votes = await PinService.getPinVotes(req.params['id'] as string);
  success(res, votes);
});

export const deletePin = catchAsync(async (req: Request, res: Response) => {
  await PinService.deletePin(
    req.params['id'] as string,
    req.sessionId,
    req.user?.id,
  );
  _io.emit('pin_removed', { pinId: req.params['id'] });
  success(res, { deleted: true });
});

// server/src/controllers/pins.controller.ts
// HTTP layer for pins — extracts validated data, calls service, returns response.
import * as PinService from '../services/pins.service.js';
import * as VotesService from '../services/votes.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
// io is injected at route-mount time so controllers stay testable without sockets
let _io;
export const setIo = (io) => { _io = io; };
export const getActivePins = catchAsync(async (_req, res) => {
    const pins = await PinService.getActivePins();
    success(res, pins);
});
export const createPin = catchAsync(async (req, res) => {
    if (req.sessionId === null) {
        throw new AppError('x-session-id header is required to drop a pin', 400);
    }
    const pin = await PinService.createPin({
        ...req.body,
        sessionId: req.sessionId,
        userId: req.user?.id ?? null,
    }, _io);
    created(res, pin);
});
export const voteOnPin = catchAsync(async (req, res) => {
    if (req.sessionId === null) {
        throw new AppError('x-session-id header is required to vote', 400);
    }
    const result = await VotesService.castVote({
        pinId: req.params['id'],
        sessionId: req.sessionId,
        vote: req.body.vote,
    });
    if (result.removed) {
        _io.emit('pin_removed', { pinId: req.params['id'] });
    }
    else {
        _io.emit('pin_credibility_update', {
            pinId: req.params['id'],
            credibilityScore: result.credibilityScore,
        });
    }
    success(res, result);
});
export const getPinVotes = catchAsync(async (req, res) => {
    const votes = await PinService.getPinVotes(req.params['id']);
    success(res, votes);
});
export const deletePin = catchAsync(async (req, res) => {
    await PinService.deletePin(req.params['id'], req.sessionId, req.user?.id);
    _io.emit('pin_removed', { pinId: req.params['id'] });
    success(res, { deleted: true });
});
//# sourceMappingURL=pins.controller.js.map
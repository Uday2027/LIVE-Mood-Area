// server/src/controllers/neighborhoods.controller.ts
// HTTP layer for neighborhood queries and mood reporting.
import * as MoodService from '../services/mood.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';
export const getAllNeighborhoods = catchAsync(async (_req, res) => {
    const neighborhoods = await MoodService.getAllNeighborhoods();
    success(res, neighborhoods);
});
export const getNeighborhoodMood = catchAsync(async (req, res) => {
    const mood = await MoodService.getNeighborhoodMood(req.params['id']);
    success(res, mood);
});
export const getNeighborhoodHistory = catchAsync(async (req, res) => {
    const hours = req.query['hours'] !== undefined
        ? Number(req.query['hours'])
        : 24;
    const history = await MoodService.getMoodHistory(req.params['id'], hours);
    success(res, history);
});
//# sourceMappingURL=neighborhoods.controller.js.map
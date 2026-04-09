// server/src/controllers/auth.controller.ts
// HTTP layer for auth — register, login, and profile endpoints.
import * as AuthService from '../services/auth.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
export const register = catchAsync(async (req, res) => {
    const result = await AuthService.register(req.body);
    created(res, result);
});
export const login = catchAsync(async (req, res) => {
    const result = await AuthService.login(req.body);
    success(res, result);
});
export const getMe = catchAsync(async (req, res) => {
    if (req.user?.id === undefined)
        throw new AppError('Unauthorized', 401);
    const user = await AuthService.getProfile(req.user.id);
    success(res, user);
});
export const getMyPins = catchAsync(async (req, res) => {
    if (req.user?.id === undefined)
        throw new AppError('Unauthorized', 401);
    const { prisma } = await import('../config/database.js');
    const pins = await prisma.moodPin.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true, mood: true, message: true,
            latitude: true, longitude: true,
            credibilityScore: true, expiresAt: true, createdAt: true,
            _count: { select: { votes: true } },
        },
    });
    success(res, pins);
});
//# sourceMappingURL=auth.controller.js.map
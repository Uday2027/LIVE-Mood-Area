// server/src/middleware/auth.middleware.ts
// JWT verification — requireAuth for protected routes, optionalAuth for hybrid routes.
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
export const requireAuth = (req, _res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token === undefined) {
        next(new AppError('Authentication required', 401));
        return;
    }
    try {
        req.user = jwt.verify(token, env.JWT_SECRET);
        next();
    }
    catch {
        next(new AppError('Invalid or expired token', 401));
    }
};
export const optionalAuth = (req, _res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (typeof token === 'string') {
        try {
            req.user = jwt.verify(token, env.JWT_SECRET);
        }
        catch {
            // Token is optional — silently continue unauthenticated
        }
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map
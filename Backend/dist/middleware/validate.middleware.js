// server/src/middleware/validate.middleware.ts
// Zod request validation middleware factory.
import { AppError } from '../utils/AppError.js';
export const validate = (schema) => (req, _res, next) => {
    const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
    });
    if (!result.success) {
        const message = result.error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', ');
        next(new AppError(message, 422));
        return;
    }
    if (result.data.body !== undefined)
        req.body = result.data.body;
    if (result.data.params !== undefined)
        req.params = result.data.params;
    if (result.data.query !== undefined)
        req.query = result.data.query;
    next();
};
//# sourceMappingURL=validate.middleware.js.map
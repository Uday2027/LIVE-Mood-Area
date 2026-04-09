import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';
type RequestShape = {
    body?: ZodTypeAny;
    params?: ZodTypeAny;
    query?: ZodTypeAny;
};
export declare const validate: (schema: z.ZodObject<RequestShape>) => RequestHandler;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map
import type { Request, Response, NextFunction, RequestHandler } from 'express';
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const catchAsync: (fn: AsyncHandler) => RequestHandler;
export {};
//# sourceMappingURL=catchAsync.d.ts.map
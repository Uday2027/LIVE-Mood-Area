// server/src/utils/catchAsync.ts
// Wraps async Express handlers to forward thrown errors to errorMiddleware.
export const catchAsync = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
//# sourceMappingURL=catchAsync.js.map
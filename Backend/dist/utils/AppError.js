// server/src/utils/AppError.ts
// Custom operational error class — throw this in services for known failure paths.
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=AppError.js.map
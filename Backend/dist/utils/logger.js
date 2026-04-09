// server/src/utils/logger.ts
// Winston logger — use this everywhere, never console.log in production.
import winston from 'winston';
import { env } from '../config/env.js';
const { combine, timestamp, json, colorize, printf } = winston.format;
const devFormat = combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${String(ts)} [${level}] ${String(message)}${metaStr}`;
}));
const prodFormat = combine(timestamp(), json());
export const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: [
        new winston.transports.Console(),
        ...(env.NODE_ENV === 'production'
            ? [
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
            ]
            : []),
    ],
});
//# sourceMappingURL=logger.js.map
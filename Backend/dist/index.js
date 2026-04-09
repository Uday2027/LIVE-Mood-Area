// server/src/index.ts
// Application entry point — boots Express, Socket.io, Redis, and background jobs.
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { connectRedis } from './config/redis.js';
import { router } from './routes/index.js';
import { initSockets } from './sockets/index.js';
import { startJobs } from './jobs/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { sessionMiddleware } from './middleware/session.middleware.js';
import { globalRateLimit } from './middleware/rateLimit.middleware.js';
import { setIo } from './controllers/pins.controller.js';
import { logger } from './utils/logger.js';
async function boot() {
    // Connect Redis before starting the HTTP server
    await connectRedis();
    const app = express();
    const server = http.createServer(app);
    // ── Security ────────────────────────────────────────────────────────────────
    app.use(helmet());
    app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
    app.use(globalRateLimit);
    // ── Body parsing ─────────────────────────────────────────────────────────────
    app.use(express.json({ limit: '10kb' }));
    // ── Session injection ─────────────────────────────────────────────────────────
    app.use(sessionMiddleware);
    // ── Routes ───────────────────────────────────────────────────────────────────
    app.use('/api', router);
    // ── Error handler (must be last) ─────────────────────────────────────────────
    app.use(errorMiddleware);
    // ── Socket.io ────────────────────────────────────────────────────────────────
    const io = new Server(server, {
        cors: { origin: env.CLIENT_URL, credentials: true },
    });
    setIo(io); // Inject io into pins controller for socket emissions
    initSockets(io);
    // ── Background jobs ───────────────────────────────────────────────────────────
    startJobs(io);
    server.listen(env.PORT, () => {
        logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
}
boot().catch((err) => {
    logger.error('Failed to start server', { err });
    process.exit(1);
});
//# sourceMappingURL=index.js.map
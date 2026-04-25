// server/src/index.ts
// Application entry point — boots Express, Socket.io, Redis, and background jobs.

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Server } from 'socket.io';

import { env } from './config/env.js';
import { connectRedis } from './config/redis.js';
import { router } from './routes/index.js';
import { initSockets } from './sockets/index.js';
import { startJobs } from './jobs/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { sessionMiddleware } from './middleware/session.middleware.js';
import { globalRateLimit } from './middleware/rateLimit.middleware.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { setIo } from './controllers/pins.controller.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/database.js';
import { redisClient } from './config/redis.js';

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

async function boot(): Promise<void> {
  // Connect Redis before starting the HTTP server
  await connectRedis();

  const app    = express();
  const server = http.createServer(app);

  // ── Security & Performance ──────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ 
    origin: env.CLIENT_URL, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));
  app.use(compression());
  app.use(globalRateLimit);

  // ── Response Time Logger ────────────────────────────────────────────────────
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 500) {
        logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
      }
    });
    next();
  });

  // ── Body parsing & Sanitization ─────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(sanitizeInput);

  // ── Session injection ─────────────────────────────────────────────────────────
  app.use(sessionMiddleware);

  // ── Health Check ─────────────────────────────────────────────────────────────
  app.get('/api/health', async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', db: 'connected', redis: redisClient.isOpen ? 'connected' : 'disconnected' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
  });

  // ── Routes ───────────────────────────────────────────────────────────────────
  app.use('/api', router);

  // ── Error handler (must be last) ─────────────────────────────────────────────
  app.use(errorMiddleware);

  // ── Socket.io ────────────────────────────────────────────────────────────────
  const io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  setIo(io);          // Inject io into pins controller for socket emissions
  initSockets(io);

  // ── Background jobs ───────────────────────────────────────────────────────────
  startJobs(io);

  server.listen(env.PORT, () => {
    logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // ── Graceful Shutdown ────────────────────────────────────────────────────────
  const shutdown = async () => {
    logger.info('Shutting down server gracefully...');
    server.close(async () => {
      logger.info('HTTP server closed.');
      io.close();
      await prisma.$disconnect();
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

boot().catch((err: unknown) => {
  logger.error('Failed to start server', { err });
  process.exit(1);
});

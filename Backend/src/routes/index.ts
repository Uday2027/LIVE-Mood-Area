// server/src/routes/index.ts
// Root router — mounts all sub-routers and exposes the health endpoint.

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { prisma } from '../config/database.js';
import pinRoutes          from './pins.js';
import neighborhoodRoutes from './neighborhoods.js';
import authRoutes         from './auth.js';
import * as AuthController from '../controllers/auth.controller.js';

export const router = Router();

router.use('/pins',          pinRoutes);
router.use('/neighborhoods', neighborhoodRoutes);
router.use('/auth',          authRoutes);

// Personal pin history lives under /users namespace
router.get('/users/me/pins', requireAuth, AuthController.getMyPins);

// Railway / Docker health check
router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

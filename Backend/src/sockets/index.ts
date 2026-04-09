// server/src/sockets/index.ts
// Socket.io server initialisation — registers all event handlers.

import type { Server } from 'socket.io';
import { pinHandler } from './pinHandler.js';
import { logger } from '../utils/logger.js';

export const initSockets = (io: Server): void => {
  io.on('connection', (socket) => {
    pinHandler(io, socket);
  });

  logger.info('Socket.io initialised');
};

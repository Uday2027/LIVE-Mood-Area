// server/src/sockets/pinHandler.ts
// Socket event handlers for real-time pin and vote updates.
// No business logic here — delegates to services.

import type { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger.js';

export const pinHandler = (io: Server, socket: Socket): void => {
  logger.debug('Client connected', { socketId: socket.id });

  socket.on('disconnect', () => {
    logger.debug('Client disconnected', { socketId: socket.id });
  });
};

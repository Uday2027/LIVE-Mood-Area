// server/src/sockets/index.ts
// Socket.io server initialisation — registers all event handlers.

import type { Server } from 'socket.io';
import { pinHandler } from './pinHandler.js';
import { matchHandler } from './matchHandler.js';
import { circleHandler } from './circleHandler.js';
import { logger } from '../utils/logger.js';

export const initSockets = (io: Server): void => {
  io.on('connection', (socket) => {
    const sessionId = socket.handshake.auth?.sessionId as string | undefined;
    if (!sessionId) { 
      socket.disconnect(true); 
      return; 
    }

    socket.join(`session:${sessionId}`);

    pinHandler(io, socket);
    matchHandler(io, socket);
    circleHandler(io, socket);
    
    socket.on('disconnect', () => {});
  });

  logger.info('Socket.io initialised');
};

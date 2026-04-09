// server/src/sockets/index.ts
// Socket.io server initialisation — registers all event handlers.
import { pinHandler } from './pinHandler.js';
import { logger } from '../utils/logger.js';
export const initSockets = (io) => {
    io.on('connection', (socket) => {
        pinHandler(io, socket);
    });
    logger.info('Socket.io initialised');
};
//# sourceMappingURL=index.js.map
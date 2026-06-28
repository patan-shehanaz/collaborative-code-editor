import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { registerRoomHandlers } from './roomHandler';

export const initSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Ensure we handle potential socket transport options (Websocket, polling fallback)
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`[Socket] Connection opened: ${socket.id}`);

    // Register collaboration, room, and presence events
    registerRoomHandlers(io, socket);
  });

  logger.info('🔌 Socket.IO server attached to Express HTTP server');
  return io;
};

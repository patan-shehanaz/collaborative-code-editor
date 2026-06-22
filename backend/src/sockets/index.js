const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, CLIENT_ORIGIN } = require('../config/env');
const { registerRoomHandlers } = require('./roomHandlers');
const { registerEditHandlers } = require('./editHandlers');

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN, credentials: true },
  });

  // Authenticate every socket connection with the same JWT issued by POST /api/auth/login.
  // The frontend passes it as: io(url, { auth: { token, name } })
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = { id: decoded.id, name: socket.handshake.auth?.name || 'Anonymous' };
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
    registerEditHandlers(io, socket);
  });

  return io;
};

module.exports = initSocket;

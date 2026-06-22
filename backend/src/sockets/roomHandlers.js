const presenceService = require('../services/presenceService');

const registerRoomHandlers = (io, socket) => {
  socket.on('join-room', ({ roomCode }) => {
    const { id: userId, name } = socket.user;

    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    presenceService.join(roomCode, socket.id, { userId, name });

    // Tell everyone in the room (including the joiner) who's currently present.
    io.to(roomCode).emit('presence-update', presenceService.listParticipants(roomCode));
    socket.to(roomCode).emit('user-joined', { userId, name });
  });

  socket.on('cursor-update', ({ roomCode, fileId, cursor }) => {
    presenceService.updateCursor(roomCode, socket.id, { fileId, cursor });
    socket.to(roomCode).emit('cursor-update', {
      userId: socket.user.id,
      name: socket.user.name,
      fileId,
      cursor,
    });
  });

  socket.on('leave-room', ({ roomCode }) => handleLeave(io, socket, roomCode));

  socket.on('disconnect', () => {
    if (socket.data.roomCode) handleLeave(io, socket, socket.data.roomCode);
  });
};

const handleLeave = (io, socket, roomCode) => {
  presenceService.leave(roomCode, socket.id);
  socket.leave(roomCode);
  io.to(roomCode).emit('presence-update', presenceService.listParticipants(roomCode));
  socket.to(roomCode).emit('user-left', { userId: socket.user.id, name: socket.user.name });
};

module.exports = { registerRoomHandlers };

// In-memory presence tracking: which users (and their cursors) are active in which room.
// Fine for an MVP / single server instance. Swap for a Redis-backed store
// (e.g. ioredis with a hash per room) if you scale to multiple server instances,
// since this Map only lives inside one process.

const rooms = new Map(); // roomCode -> Map<socketId, { userId, name, fileId, cursor }>

const join = (roomCode, socketId, userInfo) => {
  if (!rooms.has(roomCode)) rooms.set(roomCode, new Map());
  rooms.get(roomCode).set(socketId, { ...userInfo, fileId: null, cursor: null });
};

const leave = (roomCode, socketId) => {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.delete(socketId);
  if (room.size === 0) rooms.delete(roomCode);
};

const updateCursor = (roomCode, socketId, { fileId, cursor }) => {
  const room = rooms.get(roomCode);
  if (!room || !room.has(socketId)) return;
  room.set(socketId, { ...room.get(socketId), fileId, cursor });
};

const listParticipants = (roomCode) => {
  const room = rooms.get(roomCode);
  return room ? Array.from(room.values()) : [];
};

const isRoomEmpty = (roomCode) => !rooms.has(roomCode) || rooms.get(roomCode).size === 0;

module.exports = { join, leave, updateCursor, listParticipants, isRoomEmpty };

const Room = require('../models/Room');
const File = require('../models/File');
const generateRoomCode = require('../utils/roomCodeGenerator');

const createRoom = async ({ name, ownerId, defaultLanguage }) => {
  const room = await Room.create({
    name,
    owner: ownerId,
    members: [ownerId],
    roomCode: generateRoomCode(),
    defaultLanguage: defaultLanguage || 'javascript',
  });

  // Every room starts with one default file so the editor has something open immediately.
  await File.create({
    room: room._id,
    filename: 'main.js',
    language: room.defaultLanguage,
  });

  return room;
};

const joinRoom = async ({ roomCode, userId }) => {
  const room = await Room.findOne({ roomCode });
  if (!room) {
    const err = new Error('Room not found');
    err.statusCode = 404;
    throw err;
  }

  if (!room.members.some((id) => id.equals(userId))) {
    room.members.push(userId);
    await room.save();
  }

  return room;
};

const listUserRooms = async (userId) => Room.find({ members: userId }).sort({ updatedAt: -1 });

const deleteRoom = async ({ roomId, userId }) => {
  const room = await Room.findById(roomId);
  if (!room) {
    const err = new Error('Room not found');
    err.statusCode = 404;
    throw err;
  }
  if (!room.owner.equals(userId)) {
    const err = new Error('Only the room owner can delete this room');
    err.statusCode = 403;
    throw err;
  }

  await File.deleteMany({ room: room._id });
  await room.deleteOne();
};

module.exports = { createRoom, joinRoom, listUserRooms, deleteRoom };

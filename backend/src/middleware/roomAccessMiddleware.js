const Room = require('../models/Room');

// Ensures the authenticated user is a member (or owner) of the room referenced by
// req.params.roomCode (or req.params.roomId). Attaches the room doc as req.room.
const requireRoomAccess = async (req, res, next) => {
  try {
    const identifier = req.params.roomCode || req.params.roomId;
    const room = req.params.roomCode
      ? await Room.findOne({ roomCode: identifier })
      : await Room.findById(identifier);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember =
      room.owner.equals(req.user._id) ||
      room.members.some((memberId) => memberId.equals(req.user._id));

    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this room' });
    }

    req.room = room;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireRoomAccess };

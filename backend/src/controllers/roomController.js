const Room = require('../models/Room');

// POST /api/rooms  — create a room
async function createRoom(req, res) {
  try {
    const { roomId, name, language } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'roomId is required' });
    }

    const existing = await Room.findOne({ roomId });
    if (existing) {
      // Room already exists — just return it (idempotent)
      return res.json({ room: existing });
    }

    const room = await Room.create({
      roomId,
      name: name || 'Untitled Room',
      language: language || 'javascript',
      createdBy: req.user ? req.user.id : null,
    });

    return res.status(201).json({ room });
  } catch (err) {
    console.error('createRoom error:', err);
    return res.status(500).json({ message: 'Could not create room' });
  }
}

// GET /api/rooms/:roomId  — get room metadata
async function getRoom(req, res) {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    return res.json({ room });
  } catch (err) {
    return res.status(500).json({ message: 'Could not fetch room' });
  }
}

// PATCH /api/rooms/:roomId/language  — update language
async function updateLanguage(req, res) {
  try {
    const { language } = req.body;
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { language },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    return res.json({ room });
  } catch (err) {
    return res.status(500).json({ message: 'Could not update language' });
  }
}

module.exports = { createRoom, getRoom, updateLanguage };

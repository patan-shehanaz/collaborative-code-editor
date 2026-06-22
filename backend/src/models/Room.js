const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      default: 'Untitled Room',
      trim: true,
    },
    language: {
      type: String,
      default: 'javascript',
      enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'go'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // nullable — guests can create rooms
    },
    // Snapshot of Yjs document state (base64-encoded Uint8Array)
    yjsState: {
      type: String,
      default: null,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);

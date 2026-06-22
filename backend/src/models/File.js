const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    filename: { type: String, required: true, trim: true },
    language: { type: String, default: 'javascript' },
    // Latest persisted Yjs document state (binary CRDT update), used to restore
    // content when a file is reopened after every client has disconnected.
    yDocState: { type: Buffer, default: null },
  },
  { timestamps: true }
);

fileSchema.index({ room: 1, filename: 1 }, { unique: true });

module.exports = mongoose.model('File', fileSchema);
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    filename: { type: String, required: true, trim: true },
    language: { type: String, default: 'javascript' },
    // Latest persisted Yjs document state (binary CRDT update), used to restore
    // content when a file is reopened after every client has disconnected.
    yDocState: { type: Buffer, default: null },
  },
  { timestamps: true }
);

fileSchema.index({ room: 1, filename: 1 }, { unique: true });

module.exports = mongoose.model('File', fileSchema);

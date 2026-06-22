const mongoose = require('mongoose');

const snapshotSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true, index: true },
    content: { type: String, required: true }, // plain-text snapshot decoded from the Yjs doc
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Snapshot', snapshotSchema);

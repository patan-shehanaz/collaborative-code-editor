const Y = require('yjs');
const File = require('../models/File');
const { SNAPSHOT_INTERVAL_MS } = require('../config/env');

// This is the actual collaborative-editing engine. Each open file gets one
// server-side Y.Doc, kept in memory for as long as at least one client has it open.
// Clients send/receive raw Yjs update blobs (Uint8Array) — the CRDT merge logic
// itself never has to be written by hand, Yjs guarantees convergence regardless
// of message order, which is what makes simultaneous edits on the same line safe.
//
// docs: fileId (string) -> { ydoc: Y.Doc, timer: NodeJS.Timeout, dirty: boolean }
const docs = new Map();

const loadDoc = async (fileId) => {
  if (docs.has(fileId)) return docs.get(fileId).ydoc;

  const ydoc = new Y.Doc();
  const file = await File.findById(fileId);

  if (file?.yDocState) {
    Y.applyUpdate(ydoc, file.yDocState);
  }

  const entry = {
    ydoc,
    dirty: false,
    timer: setInterval(() => persistDoc(fileId), SNAPSHOT_INTERVAL_MS),
  };
  docs.set(fileId, entry);

  return ydoc;
};

const persistDoc = async (fileId) => {
  const entry = docs.get(fileId);
  if (!entry || !entry.dirty) return;

  const state = Y.encodeStateAsUpdate(entry.ydoc);
  await File.findByIdAndUpdate(fileId, { yDocState: Buffer.from(state) });
  entry.dirty = false;
};

const unloadDoc = async (fileId) => {
  const entry = docs.get(fileId);
  if (!entry) return;

  await persistDoc(fileId); // always flush to MongoDB before dropping it from memory
  clearInterval(entry.timer);
  docs.delete(fileId);
};

const registerEditHandlers = (io, socket) => {
  // Client opens a file: load (or create) its Y.Doc and send back the full
  // current state so the joining client can sync up to where everyone else is.
  socket.on('open-file', async ({ fileId }, callback) => {
    const ydoc = await loadDoc(fileId);
    socket.data.openFileId = fileId;
    socket.join(`file:${fileId}`);

    const state = Y.encodeStateAsUpdate(ydoc);
    callback?.({ state: Array.from(state) });
  });

  // Client sends an incremental Yjs update after a local edit. Apply it to the
  // server's copy (for persistence) and relay it to everyone else on this file.
  socket.on('doc-update', ({ fileId, update }) => {
    const entry = docs.get(fileId);
    if (!entry) return;

    Y.applyUpdate(entry.ydoc, new Uint8Array(update));
    entry.dirty = true;

    socket.to(`file:${fileId}`).emit('doc-update', { fileId, update });
  });

  socket.on('close-file', async ({ fileId }) => {
    socket.leave(`file:${fileId}`);
    await unloadIfEmpty(io, fileId);
  });

  socket.on('disconnect', async () => {
    const fileId = socket.data.openFileId;
    if (fileId) await unloadIfEmpty(io, fileId);
  });
};

const unloadIfEmpty = async (io, fileId) => {
  const room = io.sockets.adapter.rooms.get(`file:${fileId}`);
  if (!room || room.size === 0) await unloadDoc(fileId);
};

module.exports = { registerEditHandlers };

/**
 * Socket.io server
 *
 * Implements the y-websocket protocol on top of Socket.io so that
 * the Next.js frontend can use y-socket.io (or a thin custom provider)
 * to sync Yjs documents across all users in a room.
 *
 * Events (client → server):
 *   join-room   { roomId, username }
 *   yjs-update  { roomId, update: Uint8Array (sent as number[]) }
 *   yjs-state-vector { roomId, sv: Uint8Array }   ← for initial sync
 *   language-change { roomId, language }
 *   cursor-move { roomId, cursor }
 *
 * Events (server → client):
 *   room-joined     { participants }
 *   participant-joined { username }
 *   participant-left   { username, socketId }
 *   participants-update { participants }
 *   yjs-update      { update: number[] }
 *   yjs-sync-step1  { sv: number[] }             ← diff to catch up
 *   language-changed { language }
 *   cursor-update   { socketId, username, cursor }
 */

const { Server } = require('socket.io');
const Y = require('yjs');
const Room = require('./models/Room');

// In-memory store: roomId → { ydoc, participants: Map<socketId, username> }
const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      ydoc: new Y.Doc(),
      participants: new Map(), // socketId → username
    });
  }
  return rooms.get(roomId);
}

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: (process.env.CLIENT_URL || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Allow large Yjs state vectors on first connect
    maxHttpBufferSize: 5 * 1024 * 1024, // 5 MB
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    let currentRoomId = null;
    let currentUsername = null;

    // ── JOIN ROOM ────────────────────────────────────────────────────────────
    socket.on('join-room', async ({ roomId, username }) => {
      if (!roomId) return;

      currentRoomId = roomId;
      currentUsername = username || 'Anonymous';

      socket.join(roomId);

      const room = getOrCreateRoom(roomId);
      room.participants.set(socket.id, currentUsername);

      // Load persisted Yjs state from MongoDB if this is the first connection
      if (room.participants.size === 1) {
        try {
          const dbRoom = await Room.findOne({ roomId });
          if (dbRoom && dbRoom.yjsState) {
            const stateBuffer = Buffer.from(dbRoom.yjsState, 'base64');
            Y.applyUpdate(room.ydoc, new Uint8Array(stateBuffer));
            console.log(`📂 Loaded persisted Yjs state for room ${roomId}`);
          }
        } catch (err) {
          console.error(`Failed to load Yjs state for room ${roomId}:`, err.message);
        }
      }

      // Send current participants list to the joining user
      const participantList = Array.from(room.participants.entries()).map(
        ([sid, name]) => ({ socketId: sid, username: name })
      );

      console.log("Sending room-joined:", participantList);
      socket.emit('room-joined', { participants: participantList });
      io.to(roomId).emit("participants-update", {
        participants: participantList,
      });

      // Notify others
      socket.to(roomId).emit('participant-joined', {
        socketId: socket.id,
        username: currentUsername,
      });

      // Send the full current document state to the new joiner (sync step 1)
      const currentState = Y.encodeStateAsUpdate(room.ydoc);
      if (currentState.length > 2) {
        // Only send if document has content (empty update is 2 bytes)
        socket.emit('yjs-sync-step1', { update: Array.from(currentState) });
      }

      console.log(`👤 ${currentUsername} joined room ${roomId}`);
    });

    // ── YJS UPDATE (client → server → other clients) ─────────────────────────
    socket.on('yjs-update', ({ roomId, update }) => {
      console.log("🔥 RECEIVED YJS UPDATE", roomId);
      const room = rooms.get(roomId);
      if (!room) return;

      const uint8Update = new Uint8Array(update);

      // Apply to server-side doc
      Y.applyUpdate(room.ydoc, uint8Update);

      // Broadcast to everyone else in the room
      socket.to(roomId).emit('yjs-update', { update: Array.from(uint8Update) });
    });

    // ── YJS STATE VECTOR — client requests missing ops ───────────────────────
    socket.on('yjs-state-vector', ({ roomId, sv }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const stateVector = new Uint8Array(sv);
      const diff = Y.encodeStateAsUpdate(room.ydoc, stateVector);

      if (diff.length > 2) {
        socket.emit('yjs-sync-step1', { update: Array.from(diff) });
      }
    });

    // ── LANGUAGE CHANGE ───────────────────────────────────────────────────────
    socket.on('language-change', ({ roomId, language }) => {
      // Broadcast to everyone in the room (including sender)
      io.to(roomId).emit('language-changed', { language });

      // Persist to DB
      Room.findOneAndUpdate({ roomId }, { language }).catch(() => { });
    });

    // ── CURSOR POSITION ───────────────────────────────────────────────────────
    socket.on('cursor-move', ({ roomId, cursor }) => {
      socket.to(roomId).emit('cursor-update', {
        socketId: socket.id,
        username: currentUsername,
        cursor,
      });
    });

    // ── DISCONNECT ────────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      if (!currentRoomId) return;

      const room = rooms.get(currentRoomId);
      if (!room) return;

      room.participants.delete(socket.id);

      // Notify remaining participants
      io.to(currentRoomId).emit('participant-left', {
        socketId: socket.id,
        username: currentUsername,
      });

      const participantList = Array.from(room.participants.entries()).map(
        ([sid, name]) => ({ socketId: sid, username: name })
      );
      io.to(currentRoomId).emit('participants-update', { participants: participantList });

      console.log(`👋 ${currentUsername} left room ${currentRoomId}`);

      // If room is now empty, persist Yjs state and clean up memory
      if (room.participants.size === 0) {
        try {
          const state = Y.encodeStateAsUpdate(room.ydoc);
          const base64State = Buffer.from(state).toString('base64');
          await Room.findOneAndUpdate(
            { roomId: currentRoomId },
            { yjsState: base64State },
            { upsert: true }
          );
          console.log(`💾 Persisted Yjs state for room ${currentRoomId}`);
        } catch (err) {
          console.error(`Failed to persist Yjs state for room ${currentRoomId}:`, err.message);
        }

        rooms.delete(currentRoomId);
      }
    });
  });

  return io;
}

module.exports = { initSocket };

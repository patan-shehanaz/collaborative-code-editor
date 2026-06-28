import { Server, Socket } from 'socket.io';
import * as Y from 'yjs';
import { logger } from '../config/logger';

interface Participant {
  socketId: string;
  username: string;
  roomId: string;
}

// In-memory state tracking participants across all rooms
// Map of socket.id -> Participant
const participants = new Map<string, Participant>();

// In-memory room document persistence
// Map of roomId -> Y.Doc
const roomDocs = new Map<string, Y.Doc>();

// Helper to get or create a room Y.Doc
const getOrCreateRoomDoc = (roomId: string): Y.Doc => {
  let ydoc = roomDocs.get(roomId);
  if (!ydoc) {
    ydoc = new Y.Doc();
    roomDocs.set(roomId, ydoc);
    logger.info(`[RoomPersistence] Created new in-memory Y.Doc for room "${roomId}"`);
  }
  return ydoc;
};

export const registerRoomHandlers = (io: Server, socket: Socket) => {
  
  // 1. Join Room Event
  socket.on('join-room', (payload: { roomId: string; username: string }) => {
    try {
      const { roomId, username } = payload;
      
      if (!roomId || !username) {
        logger.warn(`[Socket ${socket.id}] join-room failed: missing roomId or username`);
        return;
      }

      // Check if user is already in a room and clean up if needed
      const existing = participants.get(socket.id);
      if (existing) {
        socket.leave(existing.roomId);
        logger.info(`[Socket ${socket.id}] Cleaned up previous room ${existing.roomId}`);
      }

      // Join room
      socket.join(roomId);
      
      // Track participant
      const participant: Participant = {
        socketId: socket.id,
        username,
        roomId
      };
      participants.set(socket.id, participant);

      logger.info(`[Room ${roomId}] User "${username}" (${socket.id}) joined`);

      // Broadcast user-joined to other users in the room
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        username
      });

      // Send the current persisted state of the room document to the newly joined client
      const ydoc = getOrCreateRoomDoc(roomId);
      const stateUpdate = Y.encodeStateAsUpdate(ydoc);
      socket.emit('yjs-update', stateUpdate);
      logger.info(`[RoomPersistence] Sent current state update of room "${roomId}" to client "${username}" (${socket.id})`);

      // Broadcast updated participant list to ALL users in the room
      sendParticipantsUpdate(io, roomId);

    } catch (error) {
      logger.error(`[Socket ${socket.id}] Error in join-room handler: ${error}`);
    }
  });

  // 2. Yjs Update Transport Event
  socket.on('yjs-update', (update: any) => {
    try {
      const participant = participants.get(socket.id);
      if (!participant) {
        logger.warn(`[Socket ${socket.id}] yjs-update failed: socket is not in a room`);
        return;
      }

      const { roomId, username } = participant;
      logger.debug(`[Room ${roomId}] Received Yjs update from "${username}" (${socket.id})`);

      // Apply the update to our server-side Y.Doc for this room to persist it
      const ydoc = getOrCreateRoomDoc(roomId);
      const binaryUpdate = new Uint8Array(update);
      Y.applyUpdate(ydoc, binaryUpdate);

      // Broadcast the update to all other users in the same room (except sender)
      socket.to(roomId).emit('yjs-update', update);

    } catch (error) {
      logger.error(`[Socket ${socket.id}] Error in yjs-update handler: ${error}`);
    }
  });

  // 3. Disconnect / Cleanup Event
  socket.on('disconnecting', () => {
    try {
      const participant = participants.get(socket.id);
      if (participant) {
        const { roomId, username } = participant;
        
        // Remove from registry
        participants.delete(socket.id);
        
        logger.info(`[Room ${roomId}] User "${username}" (${socket.id}) disconnecting`);

        // Broadcast user-left to others in the room
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          username
        });

        // Broadcast updated list to the remaining users in the room
        process.nextTick(() => {
          sendParticipantsUpdate(io, roomId);
        });
      }
    } catch (error) {
      logger.error(`[Socket ${socket.id}] Error in disconnecting handler: ${error}`);
    }
  });

  socket.on('disconnect', (reason) => {
    logger.info(`[Socket ${socket.id}] Disconnected. Reason: ${reason}`);
  });
};

// Helper function to broadcast the current list of participants to all users in a room
const sendParticipantsUpdate = (io: Server, roomId: string) => {
  const roomParticipants = Array.from(participants.values())
    .filter((p) => p.roomId === roomId);
    
  io.to(roomId).emit('participants-updated', roomParticipants);
  logger.info(`[Room ${roomId}] Broadcasted updated participant list (${roomParticipants.length} online)`);
};

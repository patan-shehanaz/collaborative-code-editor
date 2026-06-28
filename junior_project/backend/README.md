# Collaborative Code Editor - Backend Server

This is the real-time backend server for the Collaborative Code Editor. It provides room management, presence tracking, and a conflict-free transport layer for Yjs CRDT document synchronization.

## Tech Stack
- **Node.js** with **TypeScript**
- **Express.js** for HTTP REST APIs
- **Socket.IO** for bi-directional real-time events
- **Winston** for application logging
- **Helmet** for HTTP security headers
- **Express Rate Limit** to prevent DOS/abuse
- **JWT & bcryptjs** for in-memory user authentication

## Features
- **Socket.IO Room Management:** Creates rooms dynamically and groups clients editing the same file.
- **Presence Tracking:** Tracks active usernames, socket IDs, and room associations. Emits live room member lists.
- **Yjs Update Transport:** Relays binary Yjs CRDT changes to all participants in a room except the sender, enabling instant sync without custom merging code on the server.
- **In-Memory JWT Authentication:** Register and login endpoints to generate and verify JWTs. Doesn't block editor collaboration.
- **Security & Logging:** Built-in helmet, API/auth rate limiters, global error boundaries, and winston logs saved in `logs/combined.log` and `logs/error.log`.

## Socket Events Reference
- `join-room` (Client -> Server): `{ roomId: string, username: string }`
- `yjs-update` (Client <-> Server): Relays Yjs binary data (`Uint8Array` / `Buffer`).
- `user-joined` (Server -> Room): Broadcasts to room members when a user joins: `{ socketId: string, username: string }`
- `user-left` (Server -> Room): Broadcasts to room members when a user disconnects/leaves: `{ socketId: string, username: string }`
- `participants-updated` (Server -> Room): Broadcasts the complete list of participants inside the room: `Array<{ socketId: string, username: string, roomId: string }>`

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env` file (see `.env.example` as reference):
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret_here
   ```

3. **Run Development Server (runs with tsx and nodemon auto-restart):**
   ```bash
   npm run dev
   ```

4. **Build and Run Production Server:**
   ```bash
   npm run build
   npm start
   ```

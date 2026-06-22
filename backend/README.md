# Collaborative Code Editor — Backend

Node.js / Express / Socket.io backend for the collaborative code editor.

## Stack
- **Express** — REST API
- **Socket.io** — real-time Yjs CRDT sync + participant tracking
- **Yjs** — CRDT document model (server-side)
- **MongoDB / Mongoose** — users, rooms, persisted Yjs state
- **JWT (jsonwebtoken + bcryptjs)** — auth
- **Judge0 (via RapidAPI)** — code execution proxy

## Folder structure
```
src/
├── server.js          # Entry point — HTTP + Socket.io
├── app.js             # Express app + routes
├── socket.js          # Socket.io logic (Yjs sync)
├── utils/
│   └── db.js          # MongoDB connection
├── models/
│   ├── User.js
│   └── Room.js
├── middleware/
│   └── auth.js        # authMiddleware, optionalAuth
├── controllers/
│   ├── authController.js
│   ├── roomController.js
│   └── executeController.js
└── routes/
    ├── auth.js
    ├── rooms.js
    └── execute.js
```

## Quick start

```bash
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, CLIENT_URL, JUDGE0_API_KEY

npm install
npm run dev   # nodemon
```

## REST API

### Auth
| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | /api/auth/register | `{ username, email, password }` | — |
| POST | /api/auth/login | `{ email, password }` | — |
| GET | /api/auth/me | — | Bearer |

### Rooms
| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | /api/rooms | `{ roomId, name?, language? }` | optional |
| GET | /api/rooms/:roomId | — | — |
| PATCH | /api/rooms/:roomId/language | `{ language }` | — |

### Execute
| Method | Path | Body |
|--------|------|------|
| POST | /api/execute | `{ code, language, stdin? }` |

## Socket.io events

### Client → Server
| Event | Payload |
|-------|---------|
| `join-room` | `{ roomId, username }` |
| `yjs-update` | `{ roomId, update: number[] }` |
| `yjs-state-vector` | `{ roomId, sv: number[] }` |
| `language-change` | `{ roomId, language }` |
| `cursor-move` | `{ roomId, cursor }` |

### Server → Client
| Event | Payload |
|-------|---------|
| `room-joined` | `{ participants }` |
| `participant-joined` | `{ socketId, username }` |
| `participant-left` | `{ socketId, username }` |
| `participants-update` | `{ participants }` |
| `yjs-update` | `{ update: number[] }` |
| `yjs-sync-step1` | `{ update: number[] }` |
| `language-changed` | `{ language }` |
| `cursor-update` | `{ socketId, username, cursor }` |

## Deploy to Render
1. Push to GitHub
2. Create a new Web Service on Render, point to this repo
3. Set env vars from `.env.example`
4. Done — Render auto-detects `render.yaml`

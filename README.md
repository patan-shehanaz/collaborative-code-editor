# 🚀 Real-Time Code Collaborator

A full-stack collaborative coding platform that enables multiple users to write, edit, and execute code together in real time through shared rooms.

Built with **Next.js**, **Node.js**, **Monaco Editor**, **Yjs**, **Socket.IO**, and **Judge0**, the application supports live code synchronization, collaborative editing, authentication, and code execution.

---

## 🌐 Live Demo

🔗 https://collaborative-code-editor-khaki.vercel.app/

---

## 📌 Project Overview

Real-Time Code Collaborator is a collaborative coding platform inspired by modern pair-programming tools. It enables developers to create shared rooms, collaborate on code in real time, and execute code directly from the browser.

The project was developed to explore:

- Real-time collaborative systems
- CRDT-based synchronization
- Team-based software engineering
- Git workflows and integration strategies
- Deployment and production debugging
- Full-stack web development

---

## ✨ Features

### 👥 Real-Time Collaborative Editing

- Shared coding rooms
- Multi-user collaboration
- Live code synchronization
- Conflict-free editing experience

### ⚡ Code Execution

- Judge0 integration
- Execute code directly from the editor
- View execution output instantly

### 🔄 CRDT-Based Synchronization

- Powered by Yjs
- Conflict-free replicated data structures (CRDTs)
- Simultaneous editing support
- Consistent document state across connected clients

### 🔐 Authentication

- User registration
- User login
- Session management
- Secure room participation

### 🏠 Room Management

- Create collaboration rooms
- Join existing rooms
- Unique room IDs
- Shared coding sessions

### 📱 Cross-Device Collaboration

Tested across:

- Desktop browsers
- Mobile browsers
- Multiple devices
- Multiple users simultaneously

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Monaco Editor
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Socket.IO

### Database

- MongoDB

### Real-Time Collaboration

- Yjs
- CRDTs
- WebSockets

### Code Execution

- Judge0 API

### Authentication

- JWT Authentication

### Deployment

- Vercel (Frontend)
- Render (Backend)

### Version Control

- Git
- GitHub

---

## 📂 Repository Structure

```text
Real-Time-Code-Collaborator/
│
├── backend/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── executeController.js
│   │   │   └── roomController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── models/
│   │   │   ├── Room.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── execute.js
│   │   │   └── rooms.js
│   │   │
│   │   ├── utils/
│   │   ├── socket.js
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── render.yaml
│
├── client/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── create-room/
│   │   │   ├── join-room/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── room/[roomId]/
│   │   │       ├── EditorComponent.tsx
│   │   │       └── page.tsx
│   │   │
│   │   └── lib/
│   │       ├── generateRoomId.ts
│   │       └── socket.ts
│   │
│   └── public/
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
cd collaborative-code-editor
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=
MONGO_URI=
JWT_SECRET=
JUDGE0_API_KEY=
CLIENT_URL=
```

Run backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
```

Run frontend:

```bash
npm run dev
```

---

## 🧪 Testing

### Authentication

- ✅ Register
- ✅ Login
- ✅ Session Handling

### Room Management

- ✅ Create Room
- ✅ Join Room
- ✅ Room Navigation

### Real-Time Collaboration

- ✅ Multiple Users
- ✅ Simultaneous Editing
- ✅ Live Synchronization
- ✅ Cross-Device Collaboration

### Code Execution

- ✅ Judge0 Integration
- ✅ Execution Output

---

## 🏗️ Engineering Practices

This project followed a collaborative Git workflow involving:

### Branching Strategy

```text
main
│
├── frontend-dev
│
└── backend-dev
```

### Development Workflow

```text
Feature Branch
↓
Testing Branch
↓
Integration Branch
↓
Review
↓
Main
```

### Practices Used

- Pull Requests
- Feature Branches
- Integration Branches
- Testing Branches
- Code Reviews
- Merge Validation
- Collaborative Debugging

---

## 📚 Key Learnings

### Software Engineering

- Team collaboration
- Branch management
- Pull request workflows
- Feature integration

### Real-Time Systems

- CRDTs
- Collaborative editing
- State synchronization

### Full-Stack Development

- Next.js
- Express.js
- API integration

### Deployment

- Vercel
- Render
- Environment management
- Production debugging

### System Thinking

This project sparked interest in:

- Distributed Systems
- Redis
- System Design
- Scalable Architectures
- Cloud Deployment

---

## 👥 Contributors

### Shehanaz Phatan

- Frontend development
- UI implementation and refinement
- Real-time collaboration testing
- Git workflow management
- Branch integration and validation
- Feature testing and debugging
- Project planning and coordination

### Sriteja

GitHub: https://github.com/sriteja-it

- Backend development contributions
- Deployment support
- Production deployment and hosting assistance
- Integration support

### Ajay Kumar

GitHub: https://github.com/ajaykumar26-0

- Judge0 integration contributions
- Backend feature implementation
- Code execution service integration

### Waiza

GitHub: https://github.com/shaikwaiza

- UI layout contributions
- Interface design support
- Frontend layout experimentation

---

## 🎯 Project Outcome

Successfully developed and deployed a working MVP supporting:

- Real-time collaborative editing
- Room-based collaboration
- Authentication
- Code execution
- Cross-device synchronization
- Team-based development workflow

This project evolved beyond a coding application and became a practical exploration of software engineering, collaborative development, deployment, and real-time systems.

---

## 🔮 Future Enhancements

- Live cursor tracking
- User presence indicators
- In-room chat
- Multiple language support
- Docker containerization
- CI/CD pipeline integration
- Redis Pub/Sub integration
- Collaborative project workspaces
- Scalable distributed architecture

---

## 📜 License

This project was developed for learning, experimentation, and educational purposes.

---

### 💡 Project Journey

This project was built after completing **Cryptoguard**, a previous team project. The experience gained there laid the foundation for exploring more complex engineering challenges such as real-time synchronization, collaborative editing, deployment workflows, and team-based software development.

What started as an idea eventually became a deployed collaborative coding platform and a valuable learning experience in software engineering.

---

**Built with collaboration, persistence, Git branches, debugging sessions, and a passion for learning software engineering. 🚀**

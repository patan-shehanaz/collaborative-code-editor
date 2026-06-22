process.env.MONGO_URI = 'mongodb://fake-for-test';
process.env.JWT_SECRET = 'test_secret';
process.env.CLIENT_ORIGIN = '*';

const http = require('http');
const jwt = require('jsonwebtoken');
const { io: ioClient } = require('socket.io-client');
const app = require('../src/app');
const initSocket = require('../src/sockets');

const server = http.createServer(app);
initSocket(server);

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  let failures = 0;

  // 1. Health check route
  const healthRes = await fetch(`http://127.0.0.1:${port}/health`);
  const healthBody = await healthRes.json();
  if (healthRes.status === 200 && healthBody.status === 'ok') {
    console.log('PASS: GET /health');
  } else {
    console.log('FAIL: GET /health', healthRes.status, healthBody);
    failures++;
  }

  // 2. Protected route without token -> 401
  const noAuthRes = await fetch(`http://127.0.0.1:${port}/api/rooms`);
  if (noAuthRes.status === 401) {
    console.log('PASS: GET /api/rooms without token -> 401');
  } else {
    console.log('FAIL: expected 401, got', noAuthRes.status);
    failures++;
  }

  // 3. Socket connection without token -> should be rejected
  await new Promise((resolve) => {
    const badSocket = ioClient(`http://127.0.0.1:${port}`, { auth: {} });
    badSocket.on('connect_error', (err) => {
      console.log('PASS: socket without token rejected ->', err.message);
      badSocket.close();
      resolve();
    });
    badSocket.on('connect', () => {
      console.log('FAIL: socket without token was accepted');
      failures++;
      badSocket.close();
      resolve();
    });
  });

  // 4. Two authenticated sockets join the same room, check presence + cursor relay
  await new Promise((resolve) => {
    const socketA = ioClient(`http://127.0.0.1:${port}`, {
      auth: { token: tokenFor('userA'), name: 'Alice' },
    });
    const socketB = ioClient(`http://127.0.0.1:${port}`, {
      auth: { token: tokenFor('userB'), name: 'Bob' },
    });

    let aGotPresence = false;
    let bGotCursor = false;

    socketA.on('connect', () => socketA.emit('join-room', { roomCode: 'ROOM1' }));

    socketA.on('presence-update', (participants) => {
      if (participants.length === 2 && !aGotPresence) {
        aGotPresence = true;
        console.log('PASS: presence-update reflects both participants', participants.map(p => p.name));
        socketB.emit('cursor-update', { roomCode: 'ROOM1', fileId: 'file1', cursor: { line: 3, ch: 5 } });
      }
    });

    socketB.on('connect', () => socketB.emit('join-room', { roomCode: 'ROOM1' }));

    socketA.on('cursor-update', (payload) => {
      bGotCursor = true;
      console.log('PASS: cursor-update relayed from Bob to Alice ->', payload);
      socketA.close();
      socketB.close();
      if (!aGotPresence) failures++;
      resolve();
    });

    setTimeout(() => {
      if (!bGotCursor) {
        console.log('FAIL: cursor-update was not relayed within timeout');
        failures++;
        socketA.close();
        socketB.close();
        resolve();
      }
    }, 3000);
  });

  console.log(failures === 0 ? '\nALL INTEGRATION CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  server.close(() => process.exit(failures === 0 ? 0 : 1));
});

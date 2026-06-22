require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const connectDB = require('./utils/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Attach Socket.io
initSocket(server);

// Connect to MongoDB then start listening
connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

import express from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './config/logger';
import { initSocketServer } from './socket';
import { errorMiddleware } from './middleware/errorMiddleware';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { register, login } from './controllers/authController';
import { authMiddleware, AuthenticatedRequest } from './middleware/authMiddleware';
import { runCode } from './controllers/runController';

const app = express();
const httpServer = createServer(app);

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS configuration matching CLIENT_URL
app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// 3. Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Log incoming HTTP requests via Winston
app.use((req, res, next) => {
  logger.info(`[HTTP] Request: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// 5. Rate limiting for API requests
app.use('/api/', apiLimiter);

// 6. HTTP REST Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post('/api/auth/register', authLimiter, register);
app.post('/api/auth/login', authLimiter, login);

// Protected endpoint to verify JWT
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
});

app.post('/api/run', runCode);

// Wildcard 404 handler
app.use('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server`) as any;
  err.statusCode = 404;
  next(err);
});

// 7. Global Error Handler Middleware
app.use(errorMiddleware);

// 8. Attach Socket.IO Server
const io = initSocketServer(httpServer);

// 9. Start Server Listen
httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`❌ Port ${env.PORT} is already in use! Please free port ${env.PORT} or configure a different PORT in your .env file.`);
    process.exit(1);
  } else {
    logger.error(`Server error: ${err}`);
  }
});

const server = httpServer.listen(env.PORT, () => {
  logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port [${env.PORT}]`);
});

// Graceful Shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close Socket server
  io.close(() => {
    logger.info('Socket.IO server closed.');
    
    // Close HTTP Server
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  });
  
  // Force exit if shutdown takes too long (e.g. 5s)
  setTimeout(() => {
    logger.warn('Forcing server shutdown after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Capture uncaught and unhandled errors to avoid crashing silently
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

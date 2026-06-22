require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Warning: ${key} is not set. Add it to your .env file.`);
  }
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  JUDGE0_API_URL: process.env.JUDGE0_API_URL || '',
  JUDGE0_API_KEY: process.env.JUDGE0_API_KEY || '',
  SNAPSHOT_INTERVAL_MS: Number(process.env.SNAPSHOT_INTERVAL_MS) || 30000,
  // Name of the shared Yjs text type used by every client (must match the frontend binding).
  YJS_TEXT_KEY: 'code',
};

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_key_123_change_me_in_production',
};

// Simple warning validation
if (!process.env.JWT_SECRET && env.NODE_ENV === 'production') {
  console.error('❌ CRITICAL ERROR: JWT_SECRET is not defined in production environment!');
  process.exit(1);
}

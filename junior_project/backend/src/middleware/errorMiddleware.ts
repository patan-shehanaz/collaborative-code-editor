import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error using Winston logger
  logger.error(
    `[GlobalError] ${req.method} ${req.originalUrl} - Status: ${statusCode} - Message: ${message}\nStack: ${err.stack}`
  );

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: process.env.NODE_ENV === 'development' ? message : (statusCode === 500 ? 'Internal Server Error' : message),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

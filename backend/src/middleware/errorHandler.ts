import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

interface CustomError extends Error {
  statusCode?: number;
  type?: string;
  userMessage?: string;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  });

  const statusCode = err.statusCode || 500;
  const errorType = err.type || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    error: errorType,
    message: err.userMessage || 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

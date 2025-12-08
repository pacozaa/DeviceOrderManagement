import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (err: Error | AppError, _: Request, res: Response) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, { statusCode: err.statusCode });
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Unexpected errors
  logger.error('Unexpected error:', err);
  return res.status(500).json({
    error: 'Internal server error',
  });
};

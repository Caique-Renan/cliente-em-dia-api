import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/AppError';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    let errorType = 'Bad Request';
    if (err.statusCode === 401) errorType = 'Unauthorized';
    if (err.statusCode === 403) errorType = 'Forbidden';
    if (err.statusCode === 404) errorType = 'Not Found';

    return res.status(err.statusCode).json({
      error: errorType,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Validation failed',
      issues: err.issues,
    });
  }

  console.error('Unhandled error:', err);
  
  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong',
  });
}

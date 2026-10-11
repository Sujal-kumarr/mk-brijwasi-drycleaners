import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 500) {
    console.error('Unhandled Server Error:', err);
  }

  const responseBody: {
    success: boolean;
    error: string;
    errors?: Record<string, string[]>;
    stack?: string;
  } = {
    success: false,
    error: statusCode === 500 && env.NODE_ENV === 'production' ? 'Internal server error' : message,
  };

  if (err.errors) {
    responseBody.errors = err.errors;
  }

  if (env.NODE_ENV === 'development' && err.stack) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
}

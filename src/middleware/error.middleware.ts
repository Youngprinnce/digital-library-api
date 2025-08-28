import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Set default error status if not provided
  const status = error.status || error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Log error details
  logger.error("Error occurred:", {
    error: message,
    url: req.url,
    method: req.method,
  });

  // Don't expose stack trace in production
  const response: any = {
    success: false,
    message,
  };

  res.status(status).json(response);
}

/**
 * Create an application error
 */
export function createError(message: string, status: number = 500): AppError {
  const error: AppError = new Error(message);
  error.status = status;
  error.isOperational = true;
  return error;
}

/**
 * Async error wrapper
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handle 404 errors
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export interface ApiError {
  status: number;
  code: string;
  message: string;
  errors?: any[];
  details?: string;
}

// Global error handler middleware
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const error: ApiError = err || {};

  // Validation errors
  if (error.code === "VALIDATION_ERROR") {
    logger.warn({ error }, "Validation error");
    return res.status(error.status || 400).json({
      error: error.message,
      code: error.code,
      details: error.errors,
    });
  }

  // LLM errors
  if (error.code === "LLM_ERROR") {
    logger.error({ error }, "LLM error");
    return res.status(503).json({
      error: "LLM Service unavailable",
      code: "SERVICE_UNAVAILABLE",
      details: err.message,
    });
  }

  // Session not found
  if (error.code === "SESSION_NOT_FOUND") {
    logger.warn({ error }, "Session not found");
    return res.status(404).json({
      error: "Session not found",
      code: error.code,
    });
  }

  // Default error
  const status = error.status || 500;
  const code = error.code || "INTERNAL_ERROR";

  if (status >= 500) {
    logger.error({ error }, "Unhandled error");
  }

  res.status(status).json({
    error: error.message || "Internal server error",
    code,
  });
}

// Try-catch wrapper for async route handlers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

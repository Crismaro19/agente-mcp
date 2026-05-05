import rateLimit from "express-rate-limit";
import { logger } from "../../utils/logger.js";

// Extend Express Request interface for rate limiting
declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        resetTime?: Date;
      };
    }
  }
}

// Global rate limiter: 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  skip: (req) => {
    // Skip logging for health check
    return req.path === "/api/health";
  },
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, "Rate limit exceeded");
    res.status(429).json({
      error: "Too many requests",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// Stricter limiter for chat endpoint: 30 requests per 15 minutes per IP
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many chat requests, please try again later",
  standardHeaders: true,
  handler: (req, res) => {
    logger.warn({ ip: req.ip }, "Chat rate limit exceeded");
    res.status(429).json({
      error: "Too many chat requests",
      code: "CHAT_RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// Very strict limiter for session operations: 20 per 15 minutes
export const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many session operations",
  standardHeaders: true,
  handler: (req, res) => {
    logger.warn({ ip: req.ip }, "Session rate limit exceeded");
    res.status(429).json({
      error: "Too many session operations",
      code: "SESSION_RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

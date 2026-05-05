import type { Request, Response, NextFunction } from "express";

// Restrict CORS to specific origins in production
export function corsConfig() {
  const allowedOrigins = (
    process.env.CORS_ORIGINS || "http://localhost:3000"
  ).split(",");
  const isDev = process.env.NODE_ENV !== "production";

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (isDev || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  };
}

// Security headers middleware
export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // CSP - permitir inline styles, scripts y fetch a misma origen
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'",
  );

  // No referrer
  res.setHeader("Referrer-Policy", "no-referrer");

  next();
}

// Request ID middleware for tracing
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId =
    req.headers["x-request-id"] || `${Date.now()}-${Math.random()}`;
  (req as any).id = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
}

import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initLLMClient } from "../agent/agent.js";
import { initRAG } from "../rag/service.js";
import { chatRouter } from "./routes/chat.js";
import { sessionsRouter } from "./routes/sessions.js";
import { sessionManager } from "./session-manager.js";
import { logger, pinoHttpMiddleware } from "../utils/logger.js";
import { errorHandler, asyncHandler } from "../utils/error.js";
import {
  globalLimiter,
  chatLimiter,
  sessionLimiter,
} from "./middleware/rateLimiter.js";
import {
  corsConfig,
  securityHeaders,
  requestIdMiddleware,
} from "./middleware/security.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// ============================================================================
// EXPRESS APP
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Logging middleware
app.use(pinoHttpMiddleware);

// Security headers
app.use(securityHeaders);

// CORS with configuration
app.use(cors(corsConfig()));

// JSON parsing
app.use(express.json({ limit: "10kb" }));

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(projectRoot, "..")));

// Global rate limiter
app.use(globalLimiter);

// ============================================================================
// RUTAS
// ============================================================================

// Rutas de chat con rate limiting específico
app.use("/api/chat", chatLimiter, chatRouter);

// Rutas de sesiones con rate limiting específico
app.use("/api/sessions", sessionLimiter, sessionsRouter);

/**
 * GET /api/health
 * Health check
 */
app.get(
  "/api/health",
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      sessions: sessionManager.sessionsCount(),
      environment: process.env.NODE_ENV,
    });
  }),
);

/**
 * GET /
 * Root endpoint con información de la API
 */
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Agente MCP API",
    version: "1.0.0",
    endpoints: {
      "POST /api/chat": "Envía un mensaje al agente",
      "GET /api/sessions": "Lista todas las sesiones",
      "GET /api/sessions/:sessionId": "Obtiene historial de una sesión",
      "POST /api/sessions/:sessionId/reset": "Resetea una sesión",
      "DELETE /api/sessions/:sessionId": "Elimina una sesión",
      "GET /api/health": "Health check",
    },
    example: {
      method: "POST",
      url: "/api/chat",
      body: {
        sessionId: "optional-uuid",
        message: "¿Cuál es la hora actual?",
      },
    },
  });
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn({ path: req.path, method: req.method }, "Route not found");
  res.status(404).json({
    error: "Ruta no encontrada",
    code: "NOT_FOUND",
    path: req.path,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export async function startApiServer() {
  try {
    logger.info(
      `\n╔════════════════════════════════════════════════════════════╗`,
    );
    logger.info(
      `║        🤖 Agente MCP API Server - Production Ready        ║`,
    );
    logger.info(
      `╚════════════════════════════════════════════════════════════╝\n`,
    );

    // Verificar configuración de LLM
    const llmProvider = process.env.LLM_PROVIDER || "ollama";
    logger.info(`📡 LLM Provider: ${llmProvider.toUpperCase()}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);

    if (llmProvider === "openai" && !process.env.OPENAI_API_KEY) {
      logger.error("OPENAI_API_KEY no configurada");
      process.exit(1);
    }

    // Inicializar LLM
    initLLMClient();
    logger.info("✓ LLM Client inicializado");

    // Inicializar RAG
    logger.info("🚀 Inicializando RAG...");
    try {
      await initRAG();
      logger.info("✓ RAG inicializado correctamente");
    } catch (ragError: any) {
      if (
        ragError.message?.includes("ChromaConnection") ||
        ragError.message?.includes("chromadb")
      ) {
        logger.warn("⚠️  Chroma no disponible en localhost:8000");
        logger.warn("   El agente funcionará sin RAG");
      } else {
        throw ragError;
      }
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`✓ Servidor escuchando en http://localhost:${PORT}`);
      logger.info(`📚 Documentación: http://localhost:${PORT}`);
      logger.info(`💬 Chat: POST http://localhost:${PORT}/api/chat`);
      logger.info(
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
      );
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM recibido, cerrando servidor...");
      server.close(() => {
        logger.info("Servidor cerrado");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(error, "Error al iniciar servidor");
    process.exit(1);
  }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  startApiServer();
}

export default app;

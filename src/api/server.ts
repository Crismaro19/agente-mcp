import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { initLLMClient } from "../agent/agent.js";
import { initRAG } from "../rag/service.js";
import { chatRouter } from "./routes/chat.js";
import { sessionsRouter } from "./routes/sessions.js";
import { sessionManager } from "./session-manager.js";

// ============================================================================
// EXPRESS APP
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// RUTAS
// ============================================================================

// Rutas de chat
app.use("/api/chat", chatRouter);

// Rutas de sesiones
app.use("/api/sessions", sessionsRouter);

/**
 * GET /api/health
 * Health check
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    sessions: sessionManager.sessionsCount(),
  });
});

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
// ERROR HANDLER
// ============================================================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.path,
  });
});

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export async function startApiServer() {
  try {
    console.log(
      `\n╔════════════════════════════════════════════════════════════╗`,
    );
    console.log(
      `║        🤖 Agente MCP API Server                           ║`,
    );
    console.log(
      `╚════════════════════════════════════════════════════════════╝\n`,
    );

    // Verificar configuración de LLM
    const llmProvider = process.env.LLM_PROVIDER || "ollama";
    console.log(`📡 Proveedor de LLM: ${llmProvider.toUpperCase()}`);

    if (llmProvider === "openai" && !process.env.OPENAI_API_KEY) {
      console.log("⚠️  OPENAI_API_KEY no configurada");
      console.log("   Para usar OpenAI, configura:");
      console.log("   export OPENAI_API_KEY=your_api_key_here\n");
      process.exit(1);
    }

    // Inicializar LLM
    initLLMClient();
    console.log("✓ LLM Client inicializado\n");

    // Inicializar RAG
    console.log("🚀 Inicializando RAG...");
    try {
      await initRAG();
      console.log("✓ RAG inicializado correctamente\n");
    } catch (ragError: any) {
      if (
        ragError.message?.includes("ChromaConnection") ||
        ragError.message?.includes("chromadb")
      ) {
        console.log("⚠️  Chroma no disponible en localhost:8000");
        console.log("   El agente funcionará sin RAG\n");
      } else {
        throw ragError;
      }
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✓ Servidor escuchando en http://localhost:${PORT}`);
      console.log(`\n📚 Documentación: http://localhost:${PORT}`);
      console.log(`💬 Ejemplo de chat: POST http://localhost:${PORT}/api/chat`);
      console.log(
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
      );
    });
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error);
    process.exit(1);
  }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  startApiServer();
}

export default app;

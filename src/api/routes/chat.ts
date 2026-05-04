import type { Request, Response } from "express";
import { Router } from "express";
import { runAgentChat } from "../../agent/agent.js";
import {
  sessionManager,
  type ChatRequest,
  type ChatResponse,
} from "../session-manager.js";

export const chatRouter = Router();

/**
 * POST /api/chat
 * Envía un mensaje al agente
 */
chatRouter.post(
  "/",
  async (req: Request<{}, {}, ChatRequest>, res: Response) => {
    try {
      const { sessionId, message } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({
          error: "El mensaje no puede estar vacío",
        });
      }

      // Obtener o crear sesión
      const session = sessionManager.getOrCreateSession(sessionId);

      // Agregar mensaje del usuario
      session.messages.push({ role: "user", content: message });

      console.log(`\n📩 [${session.id}] Mensaje: ${message}`);

      // Ejecutar agente
      const response = await runAgentChat(session.messages);

      // Agregar respuesta del agente
      session.messages.push({ role: "assistant", content: response });

      const chatResponse: ChatResponse = {
        sessionId: session.id,
        response,
        messages: session.messages,
      };

      res.json(chatResponse);
    } catch (error) {
      console.error("❌ Error en POST /api/chat:", error);
      res.status(500).json({
        error: "Error al procesar el mensaje",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

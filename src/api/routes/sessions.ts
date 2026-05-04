import type { Request, Response } from "express";
import { Router } from "express";
import { sessionManager } from "../session-manager.js";

export const sessionsRouter = Router();

/**
 * GET /api/sessions
 * Lista todas las sesiones activas
 */
sessionsRouter.get("/", (req: Request, res: Response) => {
  try {
    const sessions = sessionManager.getAllSessions();
    const sessionsList = sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messages.length,
    }));

    res.json({
      total: sessionsList.length,
      sessions: sessionsList,
    });
  } catch (error) {
    console.error("❌ Error en GET /api/sessions:", error);
    res.status(500).json({
      error: "Error al listar sesiones",
    });
  }
});

/**
 * GET /api/sessions/:sessionId
 * Obtiene el historial de una sesión
 */
sessionsRouter.get("/:sessionId", (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({
        error: "sessionId es requerido",
      });
    }

    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: "Sesión no encontrada",
      });
    }

    res.json({
      id: session.id,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messages.length,
      messages: session.messages,
    });
  } catch (error) {
    console.error("❌ Error en GET /api/sessions/:sessionId:", error);
    res.status(500).json({
      error: "Error al obtener sesión",
    });
  }
});

/**
 * POST /api/sessions/:sessionId/reset
 * Reset de una sesión de conversación
 */
sessionsRouter.post("/:sessionId/reset", (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({
        error: "sessionId es requerido",
      });
    }

    const session = sessionManager.resetSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: "Sesión no encontrada",
      });
    }

    res.json({
      message: "Sesión reseteada",
      sessionId: session.id,
    });
  } catch (error) {
    console.error("❌ Error en POST /api/sessions/:sessionId/reset:", error);
    res.status(500).json({
      error: "Error al resetear sesión",
    });
  }
});

/**
 * DELETE /api/sessions/:sessionId
 * Elimina una sesión
 */
sessionsRouter.delete("/:sessionId", (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        error: "sessionId es requerido",
      });
    }

    const deleted = sessionManager.deleteSession(sessionId);

    if (!deleted) {
      return res.status(404).json({
        error: "Sesión no encontrada",
      });
    }

    res.json({
      message: "Sesión eliminada",
      sessionId,
    });
  } catch (error) {
    console.error("❌ Error en DELETE /api/sessions/:sessionId:", error);
    res.status(500).json({
      error: "Error al eliminar sesión",
    });
  }
});

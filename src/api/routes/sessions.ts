import type { Request, Response } from "express";
import { Router } from "express";
import { sessionManager } from "../session-manager.js";
import { logger } from "../../utils/logger.js";
import { asyncHandler } from "../../utils/error.js";
import { SessionIdSchema, validateInput } from "../../utils/validation.js";

export const sessionsRouter = Router();

/**
 * GET /api/sessions
 * Lista todas las sesiones activas
 */
sessionsRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).id;
    logger.info({ requestId }, "Listing all sessions");

    const sessions = sessionManager.getAllSessions();
    const sessionsList = sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messages.length,
    }));

    logger.info(
      { requestId, sessionCount: sessionsList.length },
      "Sessions listed successfully",
    );

    res.json({
      total: sessionsList.length,
      sessions: sessionsList,
    });
  }),
);

/**
 * GET /api/sessions/:sessionId
 * Obtiene el historial de una sesión
 */
sessionsRouter.get(
  "/:sessionId",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).id;
    const sessionId = validateInput(SessionIdSchema, req.params);

    logger.info({ requestId, sessionId }, "Getting session history");

    const session = sessionManager.getSession(sessionId);

    if (!session) {
      logger.warn({ requestId, sessionId }, "Session not found");
      res.status(404).json({
        error: "Sesión no encontrada",
        code: "SESSION_NOT_FOUND",
        requestId,
      });
      return;
    }

    logger.info(
      { requestId, sessionId, messageCount: session.messages.length },
      "Session history retrieved",
    );

    res.json({
      id: session.id,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messages.length,
      messages: session.messages,
    });
  }),
);

/**
 * POST /api/sessions/:sessionId/reset
 * Reset de una sesión de conversación
 */
sessionsRouter.post(
  "/:sessionId/reset",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).id;
    const sessionId = validateInput(SessionIdSchema, req.params);

    logger.info({ requestId, sessionId }, "Resetting session");

    const session = sessionManager.resetSession(sessionId);

    if (!session) {
      logger.warn({ requestId, sessionId }, "Session not found for reset");
      res.status(404).json({
        error: "Sesión no encontrada",
        code: "SESSION_NOT_FOUND",
        requestId,
      });
      return;
    }

    logger.info({ requestId, sessionId }, "Session reset successfully");

    res.json({
      message: "Sesión reseteada",
      sessionId: session.id,
      resetAt: new Date().toISOString(),
    });
  }),
);

/**
 * DELETE /api/sessions/:sessionId
 * Elimina una sesión
 */
sessionsRouter.delete(
  "/:sessionId",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const requestId = (req as any).id;
    const sessionId = validateInput(SessionIdSchema, req.params);

    logger.info({ requestId, sessionId }, "Deleting session");

    const deleted = sessionManager.deleteSession(sessionId);

    if (!deleted) {
      logger.warn({ requestId, sessionId }, "Session not found for deletion");
      res.status(404).json({
        error: "Sesión no encontrada",
        code: "SESSION_NOT_FOUND",
        requestId,
      });
      return;
    }

    logger.info({ requestId, sessionId }, "Session deleted successfully");

    res.json({
      message: "Sesión eliminada",
      sessionId,
      deletedAt: new Date().toISOString(),
    });
  }),
);

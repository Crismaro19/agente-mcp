import type { Request, Response } from "express";
import { Router } from "express";
import { runAgentChat } from "../../agent/agent.js";
import {
  sessionManager,
  type ChatRequest,
  type ChatResponse,
} from "../session-manager.js";
import { logger } from "../../utils/logger.js";
import { validateInput, ChatRequestSchema } from "../../utils/validation.js";
import { asyncHandler } from "../../utils/error.js";

export const chatRouter = Router();

/**
 * POST /api/chat
 * Envía un mensaje al agente
 */
chatRouter.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as any).id;

    // Validate input
    const { sessionId, message } = validateInput(ChatRequestSchema, req.body);

    logger.info(
      { requestId, sessionId, messageLength: message.length },
      "Chat request received",
    );

    // Get or create session
    const session = sessionManager.getOrCreateSession(sessionId ?? undefined);

    // Add user message to history
    session.messages.push({ role: "user", content: message });

    logger.debug(
      { requestId, sessionId, messageCount: session.messages.length },
      "Message added to history",
    );

    try {
      // Execute agent
      const response = await runAgentChat(session.messages);

      // Add agent response to history
      session.messages.push({ role: "assistant", content: response });

      const chatResponse: ChatResponse = {
        sessionId: session.id,
        response,
        messages: session.messages,
      };

      logger.info(
        { requestId, sessionId, responseLength: response.length },
        "Chat response sent",
      );
      res.json(chatResponse);
    } catch (error) {
      logger.error(
        {
          requestId,
          sessionId,
          error: error instanceof Error ? error.message : String(error),
        },
        "LLM error",
      );

      // Remove the message that failed
      session.messages.pop();

      throw {
        status: 503,
        code: "LLM_ERROR",
        message: "Failed to generate response from LLM",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),
);

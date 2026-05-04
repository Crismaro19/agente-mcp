import { v4 as uuidv4 } from "uuid";

// ============================================================================
// TIPOS
// ============================================================================

export interface ConversationSession {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

export interface ChatRequest {
  sessionId?: string;
  message: string;
}

export interface ChatResponse {
  sessionId: string;
  response: string;
  messages: ConversationSession["messages"];
}

// ============================================================================
// ALMACENAMIENTO Y UTILIDADES
// ============================================================================

const SYSTEM_PROMPT = `
Eres un asistente inteligente y útil que habla en español.

REGLAS IMPORTANTES:
- SOLO saluda en el primer mensaje de la conversación
- Si ya respondiste antes, NO vuelvas a saludar
- No digas "Hola" repetidamente
- Responde directo a la pregunta

Usa el contexto proporcionado si existe.
`;

export class SessionManager {
  private sessions = new Map<string, ConversationSession>();

  createSession(): ConversationSession {
    const id = uuidv4();
    const session: ConversationSession = {
      id,
      createdAt: new Date(),
      lastActivity: new Date(),
      messages: [{ role: "system", content: SYSTEM_PROMPT }],
    };
    this.sessions.set(id, session);
    return session;
  }

  getOrCreateSession(sessionId?: string): ConversationSession {
    let session: ConversationSession | undefined;

    if (sessionId) {
      session = this.sessions.get(sessionId);
    }

    if (!session) {
      session = this.createSession();
    }

    session.lastActivity = new Date();
    return session;
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): ConversationSession[] {
    return Array.from(this.sessions.values());
  }

  resetSession(sessionId: string): ConversationSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.messages = [{ role: "system", content: SYSTEM_PROMPT }];
    session.lastActivity = new Date();
    return session;
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  sessionsCount(): number {
    return this.sessions.size;
  }
}

export const sessionManager = new SessionManager();

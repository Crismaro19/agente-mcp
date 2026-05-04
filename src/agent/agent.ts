import { initRAG } from "../rag/service.js";
import { LLMClient } from "../llm/client.js";
import type { Message } from "../llm/client.js";
import { detectAndExecuteTools } from "./tools.js";

let llmClient: LLMClient;

// Función para ejecutar el agente en un loop conversacional
export async function runAgentChat(
  conversationHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [],
) {
  if (!llmClient) {
    throw new Error("LLM Client no inicializado");
  }

  const lastUserMessage =
    conversationHistory
      .slice()
      .reverse()
      .find((m) => m.role === "user")?.content || "";

  // Ejecutar herramientas automáticamente basado en palabras clave
  const toolResults = await detectAndExecuteTools(lastUserMessage);

  let messages: Message[] = [];

  // 1. system base
  messages.push(conversationHistory[0]!); // system original

  // 2. contexto (si hay)
  if (toolResults.size > 0) {
    let contextMessage =
      "\n📋 CONTEXTO (información ya recopilada del sistema):\n";
    if (toolResults.has("search_docs")) {
      contextMessage += `📚 Información de la base de conocimiento:\n${toolResults.get("search_docs")}\n\n`;
    }
    if (toolResults.has("get_time")) {
      contextMessage += `⏰ Hora actual: ${toolResults.get("get_time")}\n\n`;
    }
    toolResults.forEach((value, key) => {
      if (key.startsWith("sum_")) {
        contextMessage += `🧮 Resultado: ${value}\n`;
      }
    });

    messages.push({
      role: "system",
      content: contextMessage,
    });
  }

  // 3. resto del historial
  messages.push(...conversationHistory.slice(1));

  console.log(
    `📜 Mensajes para el LLM: \n ${messages.map((m) => `[${m.role}] ${m.content}`).join("\n")}\n`,
  );
  try {
    // Con esta estrategia, no necesitamos tool calling en el LLM
    // Solo generamos la respuesta basada en el contexto
    const response = await llmClient.complete(messages);

    // Retornar respuesta final
    const finalContent = response.message.content;
    return finalContent ? finalContent.toString() : "Sin respuesta";
  } catch (error) {
    console.error("Error en el agente:", error);
    throw error;
  }
}

// Inicializar cliente LLM
export function initLLMClient() {
  llmClient = new LLMClient();
}

// Función para inicializar todo
export async function initializeAgent() {
  try {
    initLLMClient();
    await initRAG();
  } catch (error) {
    throw error;
  }
}

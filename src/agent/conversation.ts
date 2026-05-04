import * as readline from "readline";
import { runAgentChat, initLLMClient } from "./agent.js";
import { initRAG } from "../rag/service.js";

// Función para correr conversación interactiva
export async function startConversation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const conversationHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [];

  const systemPrompt = `
Eres un asistente inteligente y útil que habla en español.

REGLAS IMPORTANTES:
- SOLO saluda en el primer mensaje de la conversación
- Si ya respondiste antes, NO vuelvas a saludar
- No digas "Hola" repetidamente
- Responde directo a la pregunta

Usa el contexto proporcionado si existe.
`;

  conversationHistory.push({ role: "system", content: systemPrompt });

  const askQuestion = () => {
    rl.question("\n👤 Tú: ", async (input) => {
      if (input.toLowerCase() === "salir") {
        console.log("\n👋 ¡Hasta luego!");
        rl.close();
        return;
      }

      // Agregar pregunta del usuario al historial
      conversationHistory.push({ role: "user", content: input });

      try {
        console.log("\n🤖 Agente: Pensando...");
        const response = await runAgentChat(conversationHistory);
        console.log(`🤖 Agente: ${response}`);

        // Agregar respuesta del agente al historial
        conversationHistory.push({ role: "assistant", content: response });

        askQuestion();
      } catch (error) {
        console.error("Error:", error);
        askQuestion();
      }
    });
  };

  console.log(`
╔════════════════════════════════════════════════════════════╗
║     🤖 Agente Conversacional MCP + RAG                     ║
╚════════════════════════════════════════════════════════════╝

Puedo:
✨ Buscar en la base de conocimiento (RAG)
🧮 Realizar cálculos
🕐 Obtener la hora actual
💬 Tener conversaciones naturales

Escribe "salir" para terminar.
  `);

  askQuestion();
}

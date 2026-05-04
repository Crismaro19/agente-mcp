import "dotenv/config";
import { initLLMClient, runAgentChat } from "./agent/agent.js";
import { initRAG } from "./rag/service.js";
import { startConversation } from "./agent/conversation.js";

async function main() {
  try {
    // Verificar configuración de LLM
    const llmProvider = process.env.LLM_PROVIDER || "ollama";

    console.log(
      `📡 Proveedor de LLM configurado: ${llmProvider.toUpperCase()}`,
    );

    if (llmProvider === "openai" && !process.env.OPENAI_API_KEY) {
      console.log("⚠️  OPENAI_API_KEY no configurada");
      console.log("   Para usar OpenAI, configura la variable de entorno:");
      console.log("   export OPENAI_API_KEY=your_api_key_here\n");
      process.exit(1);
    }

    // Inicializar LLM
    initLLMClient();

    console.log("🚀 Inicializando RAG...\n");

    try {
      await initRAG();
      console.log("✓ RAG inicializado correctamente\n");
    } catch (ragError: any) {
      if (
        ragError.message?.includes("ChromaConnection") ||
        ragError.message?.includes("chromadb")
      ) {
        console.log("⚠️  Chroma no está disponible en localhost:8000");
        console.log("   Pero el agente seguirá funcionando sin RAG\n");
      } else {
        throw ragError;
      }
    }

    await startConversation();
  } catch (error) {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  }
}

main();

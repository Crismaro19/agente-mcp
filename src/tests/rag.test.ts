import "dotenv/config";
import { initRAG, searchRAG } from "../rag/service.js";

async function testRAG() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log("⚠️  OPENAI_API_KEY no configurada");
      console.log("   Para probar RAG, configura la variable de entorno:");
      console.log("   export OPENAI_API_KEY=your_api_key_here\n");
      process.exit(0);
    }

    console.log("🚀 Inicializando RAG...\n");

    try {
      await initRAG();
      console.log("✓ RAG inicializado\n");

      console.log("=".repeat(50));
      console.log("🧪 Probando búsquedas RAG");
      console.log("=".repeat(50) + "\n");

      // Prueba 1: Búsqueda sobre saldo
      console.log("1️⃣  Buscando información sobre 'saldo'...");
      const result1 = await searchRAG("¿Qué es el saldo?");
      console.log("   Resultados encontrados:");
      result1?.forEach((doc) => console.log(`     • ${doc}`));
      console.log();

      // Prueba 2: Búsqueda sobre interés
      console.log("2️⃣  Buscando información sobre 'interés'...");
      const result2 = await searchRAG("¿Cómo se calcula el interés?");
      console.log("   Resultados encontrados:");
      result2?.forEach((doc) => console.log(`     • ${doc}`));
      console.log();

      // Prueba 3: Búsqueda sobre tasa
      console.log("3️⃣  Buscando información sobre 'tasa'...");
      const result3 = await searchRAG("¿Qué tipos de tasa existen?");
      console.log("   Resultados encontrados:");
      result3?.forEach((doc) => console.log(`     • ${doc}`));
      console.log();

      console.log("=".repeat(50));
      console.log("✓ Todas las pruebas RAG completadas!");
      console.log("=".repeat(50));
    } catch (ragError: any) {
      if (
        ragError.message?.includes("ChromaConnection") ||
        ragError.message?.includes("chromadb")
      ) {
        console.log("❌ Error de conexión con ChromaDB:");
        console.log(`   ${ragError.message}\n`);
        console.log("⚠️  ChromaDB no está disponible");
        console.log("   ChromaDB se requiere para almacenar embeddings.\n");
        console.log("📌 Opciones:\n");
        console.log("   1. Instalar ChromaDB localmente:");
        console.log("      pip install chromadb");
        console.log("      chroma run --path ./chroma_data\n");
        console.log("   2. O usar ChromaDB en modo cliente/servidor\n");
        console.log("   3. O reemplazar con otra solución de embeddings\n");
      } else {
        throw ragError;
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testRAG();

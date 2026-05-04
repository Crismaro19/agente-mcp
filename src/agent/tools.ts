import { searchRAG } from "../rag/service.js";
import type { ToolDefinition } from "../llm/client.js";

// Definición de herramientas disponibles
export const tools: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_time",
      description: "Obtiene la hora actual",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sum_numbers",
      description: "Suma dos números",
      parameters: {
        type: "object",
        properties: {
          a: { type: "number", description: "Primer número" },
          b: { type: "number", description: "Segundo número" },
        },
        required: ["a", "b"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_docs",
      description: "Busca documentos relevantes en la base de conocimiento RAG",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Consulta de búsqueda" },
        },
        required: ["query"],
      },
    },
  },
];

// Ejecutores de herramientas
export async function executeTool(
  toolName: string,
  toolInput: Record<string, any>,
): Promise<string> {
  switch (toolName) {
    case "get_time":
      return new Date().toISOString();

    case "sum_numbers":
      return ((toolInput.a || 0) + (toolInput.b || 0)).toString();

    case "search_docs":
      const docs = await searchRAG(toolInput.query);
      return docs ? docs.join("\n") : "No se encontraron documentos relevantes";

    default:
      return `Herramienta desconocida: ${toolName}`;
  }
}

// Detectar y ejecutar herramientas basado en palabras clave
export async function detectAndExecuteTools(
  userMessage: string,
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const lowerMessage = userMessage.toLowerCase();

  // Detección de búsqueda en RAG
  const ragKeywords = [
    "saldo",
    "interés",
    "tasa",
    "dinero",
    "cuenta",
    "capital",
    "compuesto",
  ];
  if (ragKeywords.some((kw) => lowerMessage.includes(kw))) {
    console.log(`🔍 Buscando en RAG: "${userMessage}"`);
    try {
      const result = await executeTool("search_docs", { query: userMessage });
      results.set("search_docs", result);
      console.log(`📚 Resultados: ${result}\n`);
    } catch (e) {
      console.log(`⚠️  Error en búsqueda RAG\n`);
    }
  }

  // Detección de hora
  if (lowerMessage.includes("hora") || lowerMessage.includes("qué hora")) {
    console.log(`🕐 Obteniendo hora actual...`);
    const result = await executeTool("get_time", {});
    results.set("get_time", result);
    console.log(`⏰ Hora: ${result}\n`);
  }

  // Detección de suma (simple pattern: "X + Y")
  const sumPattern = /(\d+)\s*\+\s*(\d+)/g;
  const sumMatches = userMessage.match(sumPattern);
  if (sumMatches) {
    console.log(`🧮 Detectada operación de suma...`);
    for (const match of sumMatches) {
      const [a, b] = match.split("+").map((n) => parseInt(n.trim()));
      const result = await executeTool("sum_numbers", { a, b });
      results.set(`sum_${a}_${b}`, result);
      console.log(`   ${a} + ${b} = ${result}\n`);
    }
  }

  return results;
}

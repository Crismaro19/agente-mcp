import "dotenv/config";
import { server } from "./mcp/server.js";
import { StdioServerTransport } from "@modelcontextprotocol/server";

async function startMCPServer() {
  try {
    console.log("🚀 Iniciando servidor MCP...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("✓ Servidor MCP en escucha");
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error);
    process.exit(1);
  }
}

startMCPServer();

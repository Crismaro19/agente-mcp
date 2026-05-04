import { Client, StdioClientTransport } from "@modelcontextprotocol/client";

export const client = new Client({
  name: "agente-mcp-client",
  version: "1.0.0",
});

// Función para conectar al servidor via stdio
export async function connectToServer(serverPath: string) {
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
  });
  await client.connect(transport);
  console.log("Conectado al servidor MCP");
}

// Ejemplo de uso: listar herramientas
export async function listTools() {
  const response = await client.listTools();
  console.log("Herramientas disponibles:", response.tools);
  return response.tools;
}

// Ejemplo de uso: llamar a get_time
export async function getTime() {
  const result = await client.callTool({
    name: "get_time",
    arguments: {},
  });
  console.log("Resultado de get_time:", result);
  return result;
}

// Ejemplo de uso: llamar a sum_numbers
export async function sumNumbers(a: number, b: number) {
  const result = await client.callTool({
    name: "sum_numbers",
    arguments: { a, b },
  });
  console.log("Resultado de sum_numbers:", result);
  return result;
}

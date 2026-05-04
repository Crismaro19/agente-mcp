import { Client, StdioClientTransport } from "@modelcontextprotocol/client";

const client = new Client({
  name: "agente-mcp-client",
  version: "1.0.0",
});

async function testTools() {
  try {
    console.log("🔗 Conectando al servidor MCP...\n");

    const transport = new StdioClientTransport({
      command: "npx",
      args: ["tsx", "src/mcp/server.ts"],
    });

    await client.connect(transport);
    console.log("✓ Conectado al servidor\n");

    // Listar herramientas disponibles
    console.log("📋 Listando herramientas disponibles...");
    const toolsResponse = await client.listTools();
    console.log(`✓ Encontradas ${toolsResponse.tools.length} herramientas:\n`);

    toolsResponse.tools.forEach((tool) => {
      console.log(`  • ${tool.name}: ${tool.description}`);
    });

    console.log("\n" + "=".repeat(50));
    console.log("🧪 Probando herramientas");
    console.log("=".repeat(50) + "\n");

    // Prueba 1: get_time
    console.log("1️⃣  Llamando a get_time...");
    const timeResult = await client.callTool({
      name: "get_time",
      arguments: {},
    });
    console.log("   Resultado:", timeResult);
    console.log();

    // Prueba 2: sum_numbers
    console.log("2️⃣  Llamando a sum_numbers(5, 3)...");
    const sumResult = await client.callTool({
      name: "sum_numbers",
      arguments: { a: 5, b: 3 },
    });
    console.log("   Resultado:", sumResult);
    console.log();

    // Prueba 3: sum_numbers con otros números
    console.log("3️⃣  Llamando a sum_numbers(10, 20)...");
    const sumResult2 = await client.callTool({
      name: "sum_numbers",
      arguments: { a: 10, b: 20 },
    });
    console.log("   Resultado:", sumResult2);
    console.log();

    console.log("=".repeat(50));
    console.log("✓ Todas las pruebas completadas exitosamente!");
    console.log("=".repeat(50));

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testTools();

import { McpServer, StdioServerTransport } from "@modelcontextprotocol/server";
import * as z from "zod";

export const server = new McpServer({
  name: "agente-mcp",
  version: "1.0.0",
});

server.registerTool(
  "get_time",
  {
    description: "Obtiene la hora actual",
    inputSchema: z.object({}) as any,
  },
  async () => {
    return {
      content: [
        {
          type: "text" as const,
          text: new Date().toISOString(),
        },
      ],
    };
  },
);

server.registerTool(
  "sum_numbers",
  {
    description: "Suma dos números",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }) as any,
  },
  async (input: { a: number; b: number }) => {
    const { a, b } = input as { a: number; b: number };

    return {
      content: [
        {
          type: "text" as const,
          text: (a + b).toString(),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();

await server.connect(transport);

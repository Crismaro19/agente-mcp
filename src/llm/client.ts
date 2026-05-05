import OpenAI from "openai";
import { Ollama } from "ollama";

type Role = "user" | "assistant" | "system";

interface Message {
  role: Role;
  content: string;
  tool_calls?: Array<{
    id: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

interface CompletionResponse {
  message: {
    content: string | null;
    tool_calls: Array<{
      id: string;
      function: {
        name: string;
        arguments: string;
      };
    }>;
  };
  stop_reason: "stop" | "tool_calls" | "length" | null;
}

type LLMProvider = "openai" | "ollama";

class LLMClient {
  private provider: LLMProvider;
  private openaiClient?: OpenAI;
  private ollamaClient?: Ollama;
  private model: string;

  constructor() {
    this.provider = (process.env.LLM_PROVIDER || "openai") as LLMProvider;

    // Inicializar clientes primero
    if (this.provider === "openai") {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else if (this.provider === "ollama") {
      const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
      this.ollamaClient = new Ollama({
        host: ollamaHost,
      });
    }

    // Determinar modelo: usar configurado o default según provider
    this.model = process.env.LLM_MODEL || this.getDefaultModel();

    // Validar que el modelo sea apropiado para el provider
    if (this.provider === "ollama" && process.env.LLM_MODEL === "gpt-4o-mini") {
      console.warn(
        "\n⚠️  Aviso: Estás usando OLLAMA pero con modelo 'gpt-4o-mini' (OpenAI)\n" +
          "   Cambiando automáticamente a modelo de Ollama: qwen3.5:9b\n" +
          "   Para usar otros modelos, configura: export LLM_MODEL=neural-chat\n" +
          "   (primero: ollama pull neural-chat)\n",
      );
      this.model = "qwen3.5:9b";
    }

    console.log(
      `📡 Usando LLM: ${this.provider.toUpperCase()} (modelo: ${this.model})`,
    );
  }

  private getDefaultModel(): string {
    if (this.provider === "openai") {
      return "gpt-4o-mini";
    } else {
      return "qwen3.5:9b";
    }
  }

  async complete(
    messages: Message[],
    tools?: ToolDefinition[],
  ): Promise<CompletionResponse> {
    if (this.provider === "openai") {
      return this.completeOpenAI(messages, tools);
    } else {
      return this.completeOllama(messages);
    }
  }

  private async completeOpenAI(
    messages: Message[],
    tools?: ToolDefinition[],
  ): Promise<CompletionResponse> {
    if (!this.openaiClient) {
      throw new Error("OpenAI client no inicializado");
    }

    const openaiMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const response = await this.openaiClient.chat.completions.create({
      model: this.model,
      messages: openaiMessages as any,
      tools: tools as any,
      temperature: 0.7,
    });

    const firstChoice = response.choices[0];
    if (!firstChoice) {
      throw new Error("No hay respuesta del modelo");
    }

    const message = firstChoice.message;

    return {
      message: {
        content: message.content,
        tool_calls:
          message.tool_calls?.map((tc: any) => ({
            id: tc.id,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })) || [],
      },
      stop_reason: (firstChoice.finish_reason || "stop") as
        | "stop"
        | "tool_calls",
    };
  }

  private async completeOllama(
    messages: Message[],
  ): Promise<CompletionResponse> {
    try {
      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model || "qwen3.5:9b",
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama error: ${res.status}`);
      }

      const data = await res.json();

      const content = data.message?.content?.trim();

      if (!content) {
        throw new Error("Respuesta vacía de Ollama");
      }

      return {
        message: {
          content,
          tool_calls: [], // lo manejas tú con JSON parsing
        },
        stop_reason: "stop",
      };
    } catch (error: any) {
      throw new Error(`Error en Ollama: ${error.message}`);
    }
  }

  getProvider(): string {
    return this.provider;
  }

  getModel(): string {
    return this.model;
  }
}

export { LLMClient };
export type { Message, CompletionResponse, ToolDefinition, LLMProvider };

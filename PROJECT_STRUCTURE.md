# 📂 Proyecto agente MCP con RAG

El proyecto es una primera version de un agente MCP con RAG

## 🏗️ Estructura de Carpetas

```
src/
├── agent/                          # 🤖 Lógica del agente
│   ├── agent.ts                    # Núcleo del agente
│   ├── conversation.ts             # CLI interactiva
│   └── tools.ts                    # Herramientas (get_time, sum, search)
│
├── api/                            # 🌐 API REST HTTP
│   ├── server.ts                   # Servidor Express principal
│   ├── session-manager.ts          # Gestión de sesiones
│   ├── routes/
│   │   ├── chat.ts                 # Endpoints de chat
│   │   └── sessions.ts             # Endpoints de sesiones
│   └── middleware/                 # (Preparado para middleware)
│
├── llm/                            # 🧠 Cliente LLM
│   └── client.ts                   # OpenAI / Ollama
│
├── rag/                            # 📚 Sistema RAG
│   ├── service.ts                  # Lógica principal
│   └── embeddings.ts               # Generación de embeddings
│
├── mcp/                            # 🔧 Protocolo MCP
│   ├── server.ts                   # Servidor MCP
│   └── client.ts                   # Cliente MCP
│
├── tests/                          # 🧪 Tests
│   ├── client.test.ts              # Test de cliente MCP
│   └── rag.test.ts                 # Test de RAG
│
├── run-api-server.ts               # Lanzar API HTTP
├── run-agent-conversation.ts       # Lanzar agente CLI
├── run-mcp-server.ts               # Lanzar servidor MCP
│
├── config.ts                       # Configuración global
└── index.ts                        # Información del proyecto
```

## 🚀 Cómo Usar

### API REST (Recomendado para frontend)

```bash
npm run api
# http://localhost:3000
```

### Agente Conversacional (CLI)

```bash
npm run agent
```

### Servidor MCP

```bash
npm run server
```

### Tests

```bash
npm run test:client    # Test MCP client
npm run test:rag       # Test RAG
npm run test:all       # Ambos tests
```

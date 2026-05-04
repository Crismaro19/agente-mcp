# 🧠 Agente MCP + RAG (Local AI Agent)

Un agente conversacional basado en **Model Context Protocol (MCP)** con soporte para:

- 🔍 RAG (Retrieval Augmented Generation) con Chroma
- 🤖 LLM intercambiable (Ollama o OpenAI)
- 🔌 Tools vía MCP
- 💬 Chat interactivo (CLI + Web UI)
- ⚡ Arquitectura lista para producción local

---

## 🚀 Features

- 🧠 Memoria conversacional
- 📚 RAG con ChromaDB
- 🔌 Tools con MCP
- 🔄 Switch entre OpenAI y Ollama
- 🌐 UI web tipo chat
- ⚙️ Arquitectura desacoplada

---

## 🏗️ Arquitectura

Frontend → Backend → Agente (RAG + MCP + LLM)

---

## 📦 Requisitos

- Node.js >= 18
- Docker (opcional para Chroma)
- Ollama (opcional)
- OpenAI API Key (opcional)

---

## ⚙️ Instalación

git clone https://github.com/Crismaro19/agente-mcp
cd agente-mcp
npm install

---

## 🧠 Configuración (.env)

LLM_PROVIDER=ollama

# o

# LLM_PROVIDER=openai

OPENAI_API_KEY=tu_api_key

---

## 🧪 Ejecutar Chroma

docker run -p 8000:8000 chromadb/chroma

---

## 🤖 Ejecutar el agente

npm run dev

---

## 🌐 UI

npx serve .

---

## 🧠 Tools

- get_time
- sum_numbers
- search_docs

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

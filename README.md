cat > README.md << 'EOF'

# 🧠 Agente MCP + RAG (Local AI Agent)

Agente conversacional basado en Model Context Protocol (MCP) con:

- 🔍 RAG con ChromaDB
- 🤖 LLM intercambiable (Ollama o OpenAI)
- 🔌 Tools vía MCP
- 💬 Chat CLI + Web UI

---

## 🚀 Instalación

git clone https://github.com/Crismaro19/agente-mcp
cd agente-mcp
npm install

---

## 🤖 Instalar Ollama

### 🐧 Linux

curl -fsSL https://ollama.com/install.sh | sh  
ollama serve

---

### 🍎 Mac

brew install ollama  
ollama serve

---

### 📦 Descargar modelo

ollama pull llama3

---

## ⚙️ Configuración (.env)

LLM_PROVIDER=ollama

# o

# LLM_PROVIDER=openai

OPENAI_API_KEY=tu_api_key

---

## 🧪 Ejecutar Chroma

docker run -p 8000:8000 chromadb/chroma

---

## 🤖 Ejecutar proyecto

npm run dev

---

## 🌐 UI Web

npx serve .

Abrir:  
http://localhost:3000

---

## 🔌 Tools

- get_time
- sum_numbers
- search_docs

---

## 📄 Licencia

MIT
EOF

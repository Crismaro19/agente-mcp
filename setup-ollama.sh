#!/bin/bash

# Script para ayudar a configurar y usar Ollama con el agente

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       Setup Ollama para Agente Conversacional              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si Ollama está corriendo
if ! curl -s http://localhost:11434 > /dev/null 2>&1; then
    echo "❌ Ollama no está corriendo en localhost:11434"
    echo ""
    echo "Para iniciar Ollama:"
    echo "   ollama serve"
    echo ""
    exit 1
fi

echo "✓ Ollama está corriendo"
echo ""

# Obtener modelos disponibles
echo "📦 Modelos disponibles en Ollama:"
echo ""
MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4)

if [ -z "$MODELS" ]; then
    echo "   ⚠️  No hay modelos instalados"
    echo ""
    echo "   Descarga uno con:"
    echo "   ollama pull llama2           # Ligero (3.8GB)"
    echo "   ollama pull neural-chat      # Recomendado (4.1GB)"
    echo "   ollama pull mistral          # Rápido (4.1GB)"
    echo "   ollama pull mistral-large    # Preciso (26GB)"
    echo ""
else
    for model in $MODELS; do
        echo "   ✓ $model"
    done
    echo ""
    echo "Para usar uno:"
    echo "   export LLM_MODEL=$( echo "$MODELS" | head -1 )"
    echo "   npm run agent"
fi

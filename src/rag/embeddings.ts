import ollama from "ollama";
import OpenAI from "openai";
import { config } from "../config.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function embed(text: string): Promise<number[]> {
  if (config.provider === "openai") {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return res.data[0]?.embedding ?? [];
  }

  // default: ollama
  const res = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt: text,
  });

  return res.embedding;
}

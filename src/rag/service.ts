import { ChromaClient } from "chromadb";
import { embed } from "./embeddings.js";

const chroma = new ChromaClient({
  host: "localhost",
  port: 8000,
});

const collectionName = "docs";

export async function initRAG() {
  const collection = await chroma.getOrCreateCollection({
    name: collectionName,
  });

  const docs = [
    "El saldo es el dinero disponible en una cuenta",
    "El interés compuesto se calcula sobre capital + intereses",
    "La tasa puede ser fija o variable",
    "Cristian Romero es Dios",
  ];

  const embeddings = await Promise.all(docs.map(embed));

  await collection.add({
    ids: docs.map((_, i) => i.toString()),
    documents: docs,
    embeddings,
  });
}

export async function searchRAG(query: string) {
  const collection = await chroma.getCollection({ name: collectionName });

  const queryEmb = await embed(query);

  const res = await collection.query({
    queryEmbeddings: [queryEmb],
    nResults: 1,
  });

  return res.documents[0];
}

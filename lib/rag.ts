/**
 * RAG layer — lokale SQLite Vektordatenbank.
 *
 * Server-side only. Liest data/borderless.db (Git LFS).
 * Kein Cloud-Service, keine extra npm-Abhängigkeit außer better-sqlite3.
 *
 * Ablauf:
 *   1. Frage embedden via OpenAI
 *   2. Alle Chunks aus SQLite laden (gefiltert nach Land)
 *   3. Cosine Similarity in-memory berechnen
 *   4. Top-K zurückgeben
 *
 * Bei ~200 Chunks (NL+DE+BE) dauert der Similarity-Pass <5ms — kein Problem.
 * Ohne DB oder ohne API-Key: leeres Array, App läuft weiter.
 */

import { getDb, type DbChunk } from "./db";

export interface RagChunk {
  content: string;
  url: string;
  source_name: string;
  country: string;
  category: string;
  last_crawled_at: string;
  similarity: number;
}

/** Cosine similarity zwischen zwei Vektoren gleicher Länge. */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Embeddet die Frage und gibt die Top-K ähnlichsten Chunks zurück.
 */
export async function retrieveContext(
  question: string,
  countryFilter: string | null = null,
  topK = 5,
): Promise<RagChunk[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const db = getDb();
  if (!openaiKey || !db) return [];

  // 1. Frage embedden
  let queryEmbedding: number[];
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({ model: "text-embedding-3-small", input: question }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: Array<{ embedding: number[] }> };
    queryEmbedding = data.data?.[0]?.embedding ?? [];
    if (!queryEmbedding.length) return [];
  } catch {
    return [];
  }

  // 2. Chunks aus SQLite laden (mit optionalem Länderfilter)
  let rows: DbChunk[];
  try {
    const stmt = countryFilter
      ? db.prepare("SELECT * FROM document_chunks WHERE country = ?")
      : db.prepare("SELECT * FROM document_chunks");
    rows = (countryFilter ? stmt.all(countryFilter) : stmt.all()) as DbChunk[];
  } catch {
    return [];
  }

  // 3. Cosine Similarity für jeden Chunk berechnen
  const scored = rows.map((row) => {
    const embedding: number[] = JSON.parse(row.embedding);
    return {
      content: row.content,
      url: row.url,
      source_name: row.source_name,
      country: row.country,
      category: row.category,
      last_crawled_at: row.last_crawled_at,
      similarity: cosineSimilarity(queryEmbedding, embedding),
    };
  });

  // 4. Sortieren und Top-K zurückgeben
  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

/** Formatiert Chunks als lesbaren Kontext-Block für den System-Prompt. */
export function formatRagContext(chunks: RagChunk[]): string {
  if (!chunks.length) return "";
  return chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}] ${c.source_name} (${c.country})\n` +
        `URL: ${c.url}\n` +
        `Last verified: ${c.last_crawled_at.slice(0, 10)}\n` +
        `${c.content}`,
    )
    .join("\n\n---\n\n");
}

/** Bestes Land aus dem Nutzerprofil für gefilterte Suche. */
export function countryFilterFromProfile(profile: {
  residenceCountry?: string;
  workCountry?: string;
  studyCountry?: string;
} | null | undefined): string | null {
  if (!profile) return null;
  const countries = [profile.residenceCountry, profile.workCountry, profile.studyCountry]
    .filter((c): c is string => Boolean(c))
    .filter((v, i, a) => a.indexOf(v) === i);
  return countries.length === 1 ? countries[0] : null;
}

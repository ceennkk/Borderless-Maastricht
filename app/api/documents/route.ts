/**
 * POST /api/documents — read one document into a `DocumentAnalysis`.
 *
 * The image is held in memory for the duration of the request and then
 * discarded: nothing is written to disk, no database, no log of the content.
 * Only the caller receives the analysis.
 *
 * Extraction uses a strict JSON schema, so the response shape is guaranteed and
 * the client never has to defend against a malformed answer — only against a
 * *wrong* one, which is what the confirmation step in the UI is for.
 */
import { NextResponse } from "next/server";

import { DOCUMENT_ANALYSIS_SCHEMA, DOCUMENT_SYSTEM_PROMPT, normaliseAnalysis } from "@/lib/document-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4.1-mini";
const TIMEOUT_MS = 45_000;

/** Mirrors the client-side cap. Base64 inflates by ~4/3. */
const MAX_PAYLOAD_CHARS = 8 * 1024 * 1024;
const ALLOWED_PREFIXES = ["data:image/jpeg;base64,", "data:image/png;base64,", "data:image/webp;base64,"];

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "not_configured", message: "OPENAI_API_KEY is not set." },
      { status: 503 },
    );
  }

  let body: { imageDataUrl?: string; fileName?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Invalid JSON." }, { status: 400 });
  }

  const imageDataUrl = body.imageDataUrl ?? "";

  // Trust the payload's own prefix, not a client-supplied content type.
  if (!ALLOWED_PREFIXES.some((p) => imageDataUrl.startsWith(p))) {
    return NextResponse.json(
      { error: "bad_request", message: "Expected a JPEG, PNG or WebP image." },
      { status: 400 },
    );
  }
  if (imageDataUrl.length > MAX_PAYLOAD_CHARS) {
    return NextResponse.json(
      { error: "too_large", message: "That image is too large to process." },
      { status: 413 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        messages: [
          { role: "system", content: DOCUMENT_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyse this document." },
              { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "document_analysis", strict: true, schema: DOCUMENT_ANALYSIS_SCHEMA },
        },
        max_tokens: 900,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`[api/documents] OpenAI responded ${response.status}`);
      return NextResponse.json(
        { error: "upstream", message: "We could not read that document. Please try again." },
        { status: 502 },
      );
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "empty", message: "We could not read that document." },
        { status: 502 },
      );
    }

    return NextResponse.json(normaliseAnalysis(JSON.parse(raw), body.fileName));
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error(`[api/documents] ${aborted ? "timed out" : "request failed"}`);
    return NextResponse.json(
      {
        error: aborted ? "timeout" : "network",
        message: aborted
          ? "Reading that document took too long. Try a smaller or clearer photo."
          : "We could not reach the document reader.",
      },
      { status: 504 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

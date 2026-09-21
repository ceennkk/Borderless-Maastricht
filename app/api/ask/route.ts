/**
 * POST /api/ask — the only place in the app that holds the API key.
 *
 * The browser never sees `OPENAI_API_KEY`; it posts a question plus the local
 * profile and impacts, and gets back prose. Implemented with `fetch` rather
 * than a vendor SDK, so the project gains no dependency.
 *
 * RAG layer: before calling the model, we retrieve the most relevant chunks
 * from the Supabase vector store and inject them as grounded source material.
 * If Supabase is not configured the app degrades gracefully — no crash.
 */
import { NextResponse } from "next/server";

import {
  LIMITS,
  buildContextBlock,
  buildSystemPrompt,
  suggestFollowUps,
  type AskRequestBody,
} from "@/lib/ai-prompt";
import { retrieveContext, formatRagContext, countryFilterFromProfile } from "@/lib/rag";

export const runtime = "nodejs";
/** Never cache an answer — it is specific to the posted profile. */
export const dynamic = "force-dynamic";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4.1-mini";
const TIMEOUT_MS = 30_000;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  // No key configured is a normal state, not a crash: the client falls back to
  // the mock provider so the app keeps working.
  if (!apiKey) {
    return NextResponse.json(
      { error: "not_configured", message: "OPENAI_API_KEY is not set." },
      { status: 503 },
    );
  }

  let body: AskRequestBody;
  try {
    body = (await request.json()) as AskRequestBody;
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Invalid JSON." }, { status: 400 });
  }

  const question = (body.question ?? "").trim().slice(0, LIMITS.question);
  if (!question) {
    return NextResponse.json(
      { error: "bad_request", message: "A question is required." },
      { status: 400 },
    );
  }

  // ── RAG: retrieve grounded source chunks ─────────────────────────────────
  // Runs in parallel with nothing else (first async step), so it adds
  // only its own latency — typically 200–400 ms for embedding + DB query.
  const countryFilter = countryFilterFromProfile(body.profile);
  const ragChunks = await retrieveContext(question, countryFilter);
  const ragContext = formatRagContext(ragChunks);
  // ─────────────────────────────────────────────────────────────────────────

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: buildSystemPrompt() },
    {
      role: "system",
      content: `Context for this user:\n\n${buildContextBlock(body.profile, body.impacts ?? [])}`,
    },
  ];

  // Inject RAG chunks as a third system message when available.
  // The model is told these are live official excerpts — more trustworthy
  // than its training data for specific numbers and rules.
  if (ragContext) {
    messages.push({
      role: "system",
      content:
        "Official source excerpts retrieved from verified government and authority websites " +
        "(use these for any specific facts, thresholds, rates or rules — they are more " +
        "up-to-date than your training data):\n\n" +
        ragContext,
    });
  }

  messages.push(
    ...(body.history ?? [])
      .slice(-LIMITS.historyTurns)
      .map((m) => ({ role: m.role, content: m.text.slice(0, LIMITS.historyText) })),
    { role: "user", content: question },
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 600,
        tools: [
          {
            type: "function",
            function: {
              name: "update_profile",
              description: "Update the user's cross-border profile parameters (e.g. if they say they moved, got a new job, etc). Note: Only pass the fields that explicitly changed.",
              parameters: {
                type: "object",
                properties: {
                  residenceCountry: { type: "string", enum: ["NL", "DE", "BE"] },
                  workCountry: { type: "string", enum: ["NL", "DE", "BE"] },
                  isStudent: { type: "boolean" },
                  isEmployed: { type: "boolean" },
                  workHoursPerWeek: { type: "number" },
                }
              }
            }
          }
        ]
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`[api/ask] OpenAI responded ${response.status}`);
      return NextResponse.json(
        { error: "upstream", message: `The model provider returned ${response.status}.` },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string; tool_calls?: Array<{ function?: { name: string; arguments: string } }> } }>;
    };
    
    const message = data.choices?.[0]?.message;
    const text = message?.content?.trim() || "";
    const toolCalls = message?.tool_calls;
    
    let profileUpdate = null;
    let finalText = text;
    
    if (toolCalls && toolCalls.length > 0) {
      for (const call of toolCalls) {
        if (call.function?.name === "update_profile") {
          try {
            profileUpdate = JSON.parse(call.function.arguments);
            if (!finalText) {
               finalText = "I have updated your profile with the new information!";
            }
          } catch (e) {
            console.error("Failed to parse tool call arguments", e);
          }
        }
      }
    }

    if (!finalText && !profileUpdate) {
      return NextResponse.json(
        { error: "empty", message: "The model returned no answer." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      text: finalText,
      suggestions: suggestFollowUps(body.impacts ?? []),
      sources: ragChunks.map((c) => ({
        name: c.source_name,
        url: c.url,
        country: c.country,
        lastChecked: c.last_crawled_at.slice(0, 10),
      })),
      profileUpdate,
      mocked: false,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error(`[api/ask] ${aborted ? "timed out" : "request failed"}`);
    return NextResponse.json(
      {
        error: aborted ? "timeout" : "network",
        message: aborted ? "The model took too long to answer." : "Could not reach the model.",
      },
      { status: 504 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

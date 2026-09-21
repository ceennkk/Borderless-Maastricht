/**
 * POST /api/ask — the only place in the app that holds the API key.
 *
 * The browser never sees `OPENAI_API_KEY`; it posts a question plus the local
 * profile and impacts, and gets back prose. Implemented with `fetch` rather
 * than a vendor SDK, so the project gains no dependency.
 */
import { NextResponse } from "next/server";

import {
  LIMITS,
  buildContextBlock,
  buildSystemPrompt,
  suggestFollowUps,
  type AskRequestBody,
} from "@/lib/ai-prompt";

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

  const messages = [
    { role: "system" as const, content: buildSystemPrompt() },
    {
      role: "system" as const,
      content: `Context for this user:\n\n${buildContextBlock(body.profile, body.impacts ?? [])}`,
    },
    ...(body.history ?? [])
      .slice(-LIMITS.historyTurns)
      .map((m) => ({ role: m.role, content: m.text.slice(0, LIMITS.historyText) })),
    { role: "user" as const, content: question },
  ];

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
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Log the status only — an upstream body can echo request content.
      console.error(`[api/ask] OpenAI responded ${response.status}`);
      return NextResponse.json(
        { error: "upstream", message: `The model provider returned ${response.status}.` },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "empty", message: "The model returned no answer." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      text,
      suggestions: suggestFollowUps(body.impacts ?? []),
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

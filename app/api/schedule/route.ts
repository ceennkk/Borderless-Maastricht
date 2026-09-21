/**
 * POST /api/schedule  — start a planning run, returns a job id immediately.
 * GET  /api/schedule?id=… — poll that job.
 *
 * The agent runs as a bounded tool loop: it reads the authority registry, then
 * emits a schedule under a strict schema. It never contacts anyone — it drafts
 * messages the user sends themselves.
 *
 * ⚠ Jobs live in a module-level Map. That is honest for a hackathon MVP but has
 * two consequences: a dev-server restart loses running jobs, and it will not
 * work across multiple server instances. Replacing this with a real queue is
 * the first thing to do before deploying anywhere that scales.
 */
import { NextResponse } from "next/server";

import {
  MAX_TOOL_ROUNDS,
  SCHEDULE_SCHEMA,
  SCHEDULE_SYSTEM_PROMPT,
  SCHEDULE_TOOLS,
  buildScheduleInput,
  runTool,
} from "@/lib/schedule-prompt";
import { findAuthorityFor, getAuthority } from "@/lib/authorities";
import type { Action, ScheduleJob, SchedulePlan, UserProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4.1-mini";
const TIMEOUT_MS = 90_000;
const JOB_TTL_MS = 30 * 60 * 1000;

const jobs = new Map<string, ScheduleJob>();

function sweep() {
  const cutoff = Date.now() - JOB_TTL_MS;
  for (const [id, job] of jobs) {
    if (new Date(job.createdAt).getTime() < cutoff) jobs.delete(id);
  }
}

/* ---------------------------------- POST ---------------------------------- */

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "not_configured", message: "OPENAI_API_KEY is not set." },
      { status: 503 },
    );
  }

  let body: { profile?: UserProfile; actions?: Action[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Invalid JSON." }, { status: 400 });
  }

  const actions = (body.actions ?? []).filter((a) => !a.completed).slice(0, 12);
  if (!body.profile || actions.length === 0) {
    return NextResponse.json(
      { error: "bad_request", message: "A profile and at least one open task are required." },
      { status: 400 },
    );
  }

  sweep();

  const id = `job_${Math.random().toString(36).slice(2, 10)}`;
  const job: ScheduleJob = {
    id,
    status: "queued",
    step: "Getting started",
    log: [],
    createdAt: new Date().toISOString(),
  };
  jobs.set(id, job);

  // Deliberately not awaited: the request returns now and the agent keeps
  // working. The client polls GET for progress.
  void plan(job, body.profile, actions);

  return NextResponse.json({ id, status: job.status }, { status: 202 });
}

/* ----------------------------------- GET ---------------------------------- */

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "bad_request", message: "id is required." }, { status: 400 });
  }
  const job = jobs.get(id);
  if (!job) {
    return NextResponse.json({ error: "not_found", message: "Unknown or expired job." }, { status: 404 });
  }
  return NextResponse.json(job);
}

/* --------------------------------- the agent ------------------------------ */

async function plan(job: ScheduleJob, profile: UserProfile, actions: Action[]) {
  const advance = (step: string) => {
    if (job.step && job.step !== step) job.log.push(job.step);
    job.step = step;
  };

  try {
    job.status = "running";
    advance("Reading your open tasks");

    const anchorDate = new Date().toISOString().slice(0, 10);
    const messages: Array<Record<string, unknown>> = [
      { role: "system", content: SCHEDULE_SYSTEM_PROMPT },
      { role: "user", content: buildScheduleInput(profile, actions, anchorDate) },
    ];

    advance("Looking up the authorities involved");

    // Tool phase — bounded, read-only.
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await call({ messages, tools: SCHEDULE_TOOLS });
      const message = response.choices?.[0]?.message;
      if (!message) throw new Error("empty response");

      messages.push(message as Record<string, unknown>);
      const calls = message.tool_calls ?? [];
      if (calls.length === 0) break;

      for (const toolCall of calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          /* a malformed argument list is the model's problem; hand back an error */
        }
        const result = runTool(toolCall.function.name, args);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
      advance("Working out the right order and timing");
    }

    advance("Drafting the messages you will need");

    const final = await call({
      messages: [
        ...messages,
        {
          role: "user",
          content: "Now output the finished schedule as JSON matching the required schema.",
        },
      ],
      schema: true,
    });

    const raw = final.choices?.[0]?.message?.content;
    if (!raw) throw new Error("no schedule returned");

    job.plan = normalisePlan(JSON.parse(raw), anchorDate, actions, profile);
    advance("Done");
    job.status = "done";
  } catch (error) {
    console.error(`[api/schedule] job ${job.id} failed`);
    job.status = "error";
    job.error =
      error instanceof Error && error.message === "timeout"
        ? "Planning took too long. Please try again."
        : "We could not build a schedule. Please try again.";
  }
}

interface ChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
      tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
    };
  }>;
}

async function call({
  messages,
  tools,
  schema,
}: {
  messages: Array<Record<string, unknown>>;
  tools?: typeof SCHEDULE_TOOLS;
  schema?: boolean;
}): Promise<ChatResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        messages,
        ...(tools ? { tools } : {}),
        ...(schema
          ? {
              response_format: {
                type: "json_schema",
                json_schema: { name: "schedule", strict: true, schema: SCHEDULE_SCHEMA },
              },
            }
          : {}),
        max_tokens: 3000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`[api/schedule] OpenAI responded ${response.status}`);
      throw new Error("upstream");
    }
    return (await response.json()) as ChatResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("timeout");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

interface RawPlan {
  summary: string;
  caveats: string[];
  items: Array<Record<string, unknown>>;
}

/** Drop nulls, enforce ordering, and never let a date land in the past. */
function normalisePlan(
  raw: RawPlan,
  anchorDate: string,
  actions: Action[],
  profile: UserProfile,
): SchedulePlan {
  const byId = new Map(actions.map((a) => [a.id, a]));

  const items = (raw.items ?? [])
    .map((item, i) => {
      const doBy = String(item.doBy ?? "");
      const action = byId.get(String(item.actionId ?? ""));
      // Resolve the authority ourselves when the model left it out *or* gave
      // something that is not an id — it sometimes returns the display name
      // ("Finanzamt Aachen-Stadt") instead of the key. An unrecognised value is
      // treated as missing, and reused as a name hint, so the booking
      // preparation never silently disappears.
      const claimed = (item.authorityId as string | null) ?? undefined;
      const recognised = claimed && getAuthority(claimed) ? claimed : undefined;
      const authorityId =
        recognised ??
        findAuthorityFor({
          authority: claimed ?? action?.authority,
          category: action?.category,
          country: profile.workCountry ?? profile.residenceCountry,
        })?.id;

      return {
        actionId: String(item.actionId ?? ""),
        title: String(item.title ?? ""),
        authorityId,
        order: typeof item.order === "number" ? item.order : i + 1,
        startAfter: (item.startAfter as string | null) ?? undefined,
        doBy: doBy >= anchorDate ? doBy : anchorDate,
        channel: item.channel as SchedulePlan["items"][number]["channel"],
        appointmentRequired: Boolean(item.appointmentRequired),
        reasoning: String(item.reasoning ?? ""),
        draft: withPlaceholders(item.draft as SchedulePlan["items"][number]["draft"]),
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((item, i) => ({ ...item, order: i + 1 }));

  // The list is read top to bottom as a timeline, so a later step must never
  // carry an earlier date. Models drift on this, and "do this next, by 21 Oct"
  // above "then this, by 5 Oct" reads as a bug to the user.
  let previous = anchorDate;
  for (const item of items) {
    if (item.doBy < previous) item.doBy = previous;
    previous = item.doBy;
  }

  return {
    items,
    summary: raw.summary ?? "",
    caveats: raw.caveats ?? [],
    anchorDate,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Derive the placeholder list from the draft itself.
 *
 * The model is asked for this list too, but it forgets entries — and a missed
 * placeholder means someone posts a letter still saying "[Naam werkgever]".
 * Reading them out of the text cannot drift from the text.
 */
function withPlaceholders(
  draft: SchedulePlan["items"][number]["draft"],
): SchedulePlan["items"][number]["draft"] {
  if (!draft) return undefined;

  const found = new Set<string>();
  for (const field of [draft.subject, draft.body]) {
    for (const match of String(field ?? "").matchAll(/\[([^\]\n]{1,60})\]/g)) {
      found.add(match[1].trim());
    }
  }
  return { ...draft, placeholders: Array.from(found) };
}

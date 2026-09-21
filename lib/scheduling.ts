/**
 * Client side of the scheduling agent.
 *
 * Starts a background job, polls it, and turns the resulting plan into things
 * the user can actually act on: a calendar file and a pre-filled mail draft.
 *
 * The app never sends a message and never books a slot. `buildMailtoUrl` hands
 * the draft to the user's own mail client, where they read it, fill in their
 * details and press send themselves.
 */
import type { MessageDraft, SchedulePlan, ScheduleJob, Action, UserProfile } from "./types";

const ENDPOINT = "/api/schedule";

export class ScheduleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScheduleError";
  }
}

/** Kick off a planning run. Resolves as soon as the job exists. */
export async function startSchedule(profile: UserProfile, actions: Action[]): Promise<string> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, actions }),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new ScheduleError(
      response.status === 503
        ? "The planner is not configured. Set OPENAI_API_KEY in .env.local."
        : (detail?.message ?? "Could not start the planner."),
    );
  }
  return ((await response.json()) as { id: string }).id;
}

export async function fetchJob(id: string): Promise<ScheduleJob> {
  const response = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`);
  if (!response.ok) throw new ScheduleError("Lost track of the planning run. Please try again.");
  return (await response.json()) as ScheduleJob;
}

/* ------------------------------ calendar file ----------------------------- */

/**
 * Build an .ics the user imports into their own calendar.
 *
 * Deliberately a file rather than a calendar integration: it needs no account,
 * no OAuth and no access to anyone's calendar, and it works with every client.
 */
export function buildIcs(plan: SchedulePlan, calendarName = "Borderless"): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Borderless//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];

  for (const item of plan.items) {
    const day = item.doBy.replace(/-/g, "");
    const description = [
      item.reasoning,
      item.appointmentRequired ? "An appointment is required for this step." : "",
      "",
      "Planned by Borderless. Times and waiting periods are indicative — confirm with the authority.",
    ]
      .filter(Boolean)
      .join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${item.actionId || cryptoId()}@borderless.local`,
      `DTSTAMP:${toUtcStamp(plan.generatedAt)}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${addDay(day)}`,
      `SUMMARY:${escapeText(`${item.order}. ${item.title}`)}`,
      `DESCRIPTION:${escapeText(description)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P2D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(item.title)}`,
      "END:VALARM",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n");
}

export function downloadIcs(plan: SchedulePlan, fileName = "borderless-schedule.ics") {
  const blob = new Blob([buildIcs(plan)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/* -------------------------------- mail draft ------------------------------ */

/**
 * A mailto: URL, opened in the user's own mail client.
 * The recipient is left empty on purpose — the user picks it, so the app cannot
 * send anything anywhere by itself.
 */
export function buildMailtoUrl(draft: MessageDraft, to = ""): string {
  const params = new URLSearchParams({ subject: draft.subject, body: draft.body });
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

export async function copyDraft(draft: MessageDraft): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
    return true;
  } catch {
    return false;
  }
}

/* --------------------------------- helpers -------------------------------- */

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * RFC 5545 caps a content line at 75 **octets**, not characters.
 *
 * Counting `String.length` would undercount: an em dash is one JS char but
 * three UTF-8 bytes, so a line of prose can be conformant by character count
 * and over the limit on the wire. This measures bytes and never splits inside
 * a character.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  // A continuation line carries a leading space, which costs one octet.
  let limit = 75;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      parts.push(parts.length === 0 ? current : ` ${current}`);
      current = "";
      bytes = 0;
      limit = 74;
    }
    current += char;
    bytes += size;
  }
  if (current) parts.push(parts.length === 0 ? current : ` ${current}`);
  return parts.join("\r\n");
}

function toUtcStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function addDay(yyyymmdd: string): string {
  const d = new Date(
    Number(yyyymmdd.slice(0, 4)),
    Number(yyyymmdd.slice(4, 6)) - 1,
    Number(yyyymmdd.slice(6, 8)) + 1,
  );
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function cryptoId(): string {
  return Math.random().toString(36).slice(2, 12);
}

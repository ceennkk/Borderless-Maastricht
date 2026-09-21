/**
 * The scheduling agent's contract: tools, instructions and output schema.
 *
 * Why a tool loop rather than one prompt: the agent must not invent authority
 * names, channels or waiting times. It looks them up in `lib/authorities.ts`
 * and is told, explicitly, that anything it did not read there does not exist.
 *
 * The loop is bounded (see MAX_TOOL_ROUNDS) so a confused model cannot spin.
 */
import { authoritySummaries, getAuthority } from "./authorities";
import type { Action, UserProfile } from "./types";

export const MAX_TOOL_ROUNDS = 4;

export const SCHEDULE_SYSTEM_PROMPT = [
  "You plan the order and timing of administrative tasks for someone living, studying or working across the borders of the Netherlands, Germany and Belgium.",
  "",
  "You produce a schedule: which task first, by when, through which channel, and — where it helps — a ready-to-send message the person can review.",
  "",
  "GROUND TRUTH",
  "authorityId is the 'id' field exactly as the tool returned it (for example 'finanzamt_aachen'), never the display name.",
  "Authority names, channels, whether an appointment is needed, and waiting times come ONLY from the list_authorities and get_authority tools. If a detail is not in the tool result, it does not exist: leave the field out and add a line to 'caveats'. Never state an address, phone number, opening hour, fee or form number — you do not have that data.",
  "",
  "ORDERING",
  "Sequence tasks by real dependency, and say why in one sentence per item:",
  "- Things that unblock other things come first (a tax number is needed before a correct payslip; a signed contract is needed before social security can be assessed).",
  "- Tasks with long waiting times start early, even if their deadline is late.",
  "- Anything that must be in place before a job start date is scheduled before it.",
  "Your reasoning and your ordering must not contradict each other. If you write that a step is needed before something else, that step appears earlier in the list and carries an earlier date. Do not explain a task as urgent and then place it last.",
  "",
  "DATES",
  "doBy is the date by which THE PERSON should have done their part — sent the letter, attended the appointment, submitted the form. It is NOT the date the authority answers. Their waiting time decides the order, never the date.",
  "So a task with a long waiting time gets an EARLY doBy: you start it first precisely because the answer takes weeks.",
  "Count from the anchor date given to you. Every doBy is an ISO date (YYYY-MM-DD), and nothing is ever scheduled in the past.",
  "Spread the dates out. Leave a sensible gap between steps — a few days to a couple of weeks — so the list reads as a sequence someone can actually work through. Give two steps the same date only when they genuinely happen together.",
  "The order and the dates must agree: doBy never goes backwards from one step to the next. The list is read top to bottom as a timeline.",
  "",
  "DRAFTS",
  "Write a draft only for tasks handled by email or post, and only where a message is genuinely the next step. Write in the authority's own language, from the tool result — a German Krankenkasse gets German, a Dutch gemeente gets Dutch. Formal register, short, factual, no flattery.",
  "The person's private details are NOT available to you. Wherever one is needed, put a bracketed placeholder and write it in the same language as the letter — [Geburtsdatum] in a German letter, [geboortedatum] in a Dutch one. List every bracketed placeholder you used in 'placeholders'. Never invent a number, a date of birth or a reference.",
  "Never write anything that commits the person to something they have not agreed to. Ask for information or an appointment; do not accept, cancel or authorise.",
  "",
  "OUTPUT",
  "'summary' is ONE short sentence, at most 20 words, naming what comes first and over roughly what period. Do not list the steps — they appear underneath. Never restate the person's own situation back to them; they entered it.",
  "'caveats' are things the USER needs to know, such as a step that depends on a date they have not given you. A detail missing from your tool results is not a caveat: leave the field out silently. Never write that no contact details, URLs, fees or form numbers 'were provided' — that is our data, not their problem. Most plans need no caveats at all; an empty list is the normal case.",
  "",
  "You are scheduling, not advising. Do not restate legal rules or thresholds.",
].join("\n");

/* ---------------------------------- tools --------------------------------- */

export const SCHEDULE_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "list_authorities",
      description:
        "List every authority known to Borderless, with what it handles, its channels, whether an appointment is required and its typical waiting time in days.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_authority",
      description: "Full detail for one authority, by id, including its booking and information URLs.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
];

export function runTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case "list_authorities":
      return authoritySummaries();
    case "get_authority": {
      const authority = getAuthority(String(args.id ?? ""));
      return authority ?? { error: "unknown authority id" };
    }
    default:
      return { error: `unknown tool: ${name}` };
  }
}

/* --------------------------------- schema --------------------------------- */

export const SCHEDULE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "items", "caveats"],
  properties: {
    summary: { type: "string" },
    caveats: { type: "array", items: { type: "string" } },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "actionId",
          "title",
          "authorityId",
          "order",
          "startAfter",
          "doBy",
          "channel",
          "appointmentRequired",
          "reasoning",
          "draft",
        ],
        properties: {
          actionId: { type: "string" },
          title: { type: "string" },
          authorityId: { type: ["string", "null"] },
          order: { type: "number" },
          startAfter: { type: ["string", "null"] },
          doBy: { type: "string" },
          channel: {
            type: "string",
            enum: ["ONLINE", "IN_PERSON", "POST", "PHONE", "EMAIL"],
          },
          appointmentRequired: { type: "boolean" },
          reasoning: { type: "string" },
          draft: {
            type: ["object", "null"],
            additionalProperties: false,
            required: ["subject", "body", "language", "placeholders"],
            properties: {
              subject: { type: "string" },
              body: { type: "string" },
              language: { type: "string", enum: ["nl", "de", "fr", "en"] },
              placeholders: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
  },
} as const;

/* -------------------------------- the input ------------------------------- */

export function buildScheduleInput(
  profile: UserProfile,
  actions: Action[],
  anchorDate: string,
): string {
  const lines = [
    `Anchor date (today): ${anchorDate}`,
    "",
    "## The person",
    `- Lives in: ${profile.residenceCity || ""} (${profile.residenceCountry})`,
    profile.isEmployed && profile.workCountry
      ? `- Works in: ${profile.workCity || ""} (${profile.workCountry}), ${profile.workHoursPerWeek ?? "?"} h/week`
      : "- Not employed",
    profile.isStudent ? `- Student in ${profile.studyCity || profile.studyCountry || "?"}` : "- Not a student",
    `- Citizenship: ${profile.citizenship} (${profile.euCitizen ? "EU/EEA" : "non-EU"})`,
    "",
    "## Open tasks to schedule",
  ];

  for (const action of actions) {
    lines.push(
      `- id=${action.id} | ${action.title}` +
        (action.authority ? ` | mentioned authority: ${action.authority}` : "") +
        (action.deadline ? ` | existing deadline: ${action.deadline}` : "") +
        ` | ${action.description}`,
    );
  }

  lines.push(
    "",
    "Produce one schedule item per task, ordered. Use the tools before deciding channels or waiting times.",
  );
  return lines.join("\n");
}

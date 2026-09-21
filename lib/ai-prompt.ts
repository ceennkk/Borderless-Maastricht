/**
 * Prompt construction for the AI layer.
 *
 * Pure functions, no secrets, no network — safe to import from anywhere. The
 * route handler is the only place that holds the API key.
 *
 * The point of this module: Ask Borderless answers from the user's own profile
 * and the impacts the rule engine produced, not from the model's general
 * knowledge. Everything it is allowed to assert is assembled here.
 */
import { COUNTRY_META, IMPACT_CATEGORY_META, IMPACT_STATUS_META } from "./constants";
import { SOURCES } from "./mock-data";
import type { Impact, UserProfile } from "./types";

/** Body accepted by POST /api/ask. */
export interface AskRequestBody {
  question: string;
  profile?: UserProfile | null;
  impacts?: Impact[];
  /** Prior turns, oldest first. Trimmed server-side. */
  history?: Array<{ role: "user" | "assistant"; text: string }>;
  mode?: "ask" | "explain";
}

/** Limits applied server-side, kept here so the client can mirror them. */
export const LIMITS = {
  question: 1000,
  historyTurns: 8,
  historyText: 2000,
  impacts: 12,
} as const;

export function buildSystemPrompt(): string {
  return [
    "You are Borderless, an assistant for people living, studying or working across the borders of the Netherlands, Germany and Belgium (the Maastricht Euregio).",
    "",
    "Your job is to help the user understand their own administrative situation. You are given their profile and the areas our rule engine has already flagged. Answer from that context.",
    "",
    "THE ONE RULE YOU MUST NOT BREAK:",
    "Never state a specific number — an hour threshold, an income limit, a percentage, a rate, a deadline or an amount — unless that exact number appears in the context below. Do not estimate one, do not recall one from training, do not offer one as a typical or rough figure. A wrong number here sends someone to the wrong authority or costs them money.",
    "Instead of a number, name the rule that applies and who confirms it: 'there is an earnings threshold that decides this — the SVB can tell you which side of it you fall on'.",
    "",
    "How to answer:",
    "- Be concrete and specific to this user. Refer to their actual countries, cities and hours.",
    "- Plain language. No jargon without explaining it. Short paragraphs.",
    "- 120 words or fewer unless the user asks for detail. No preamble, no bullet-point dumps.",
    "- Never invent a rule, an entitlement or an obligation. If the context does not contain it, say what the user should check and with which authority.",
    "- Do not state legal certainty. Prefer 'usually', 'in most cases', 'you should confirm'.",
    "- Never contradict the flagged areas in the context. They are the app's own assessment of this user, and the rest of the interface shows them. If you disagree, say the point is worth confirming — do not assert the opposite.",
    "- When something genuinely matters and the answer depends on details we do not have, point the user to a GrenzInfoPunkt / Grensinfopunt consultation, which is free.",
    "- You are not a lawyer, tax advisor or insurance broker. Do not present yourself as one.",
    "- If the context contains no flagged areas, say you cannot assess their situation yet and suggest completing onboarding, rather than answering in general terms.",
    "- Answer in the language the user writes in.",
    "",
    "Refer to the app's own screens where useful: the dashboard (life areas), the What If simulator, and the action centre (concrete steps).",
  ].join("\n");
}

/** The user's situation, serialised compactly for the model. */
export function buildContextBlock(profile?: UserProfile | null, impacts: Impact[] = []): string {
  const lines: string[] = [];

  if (profile) {
    lines.push("## The user's profile");
    lines.push(`- Name: ${profile.name}`);
    lines.push(`- Lives in: ${place(profile.residenceCity, profile.residenceCountry)}`);
    lines.push(
      profile.isStudent && profile.studyCountry
        ? `- Studies in: ${place(profile.studyCity, profile.studyCountry)}`
        : "- Studies: not a student",
    );
    if (profile.isEmployed && profile.workCountry) {
      lines.push(`- Works in: ${place(profile.workCity, profile.workCountry)}`);
      if (profile.workHoursPerWeek) lines.push(`- Working hours: ${profile.workHoursPerWeek} per week`);
      if (profile.remoteWorkDaysPerWeek !== undefined) {
        lines.push(
          `- Works from home: ${profile.remoteWorkDaysPerWeek} day(s) per week, i.e. from ${COUNTRY_META[profile.residenceCountry].name}`,
        );
      }
    } else {
      lines.push("- Works: not employed");
    }
    lines.push(`- Citizenship: ${profile.citizenship} (${profile.euCitizen ? "EU/EEA" : "non-EU"})`);
    lines.push(
      profile.healthInsuranceCountry
        ? `- Health insurance in: ${COUNTRY_META[profile.healthInsuranceCountry].name}`
        : "- Health insurance: the user does not know which country insures them. Do not assume one.",
    );
    lines.push("");
  }

  if (impacts.length > 0) {
    lines.push("## Areas our rule engine flagged");
    lines.push("(Status: OK = nothing to do, CHECK = worth verifying, ACTION = something must be done.)");
    for (const impact of impacts.slice(0, LIMITS.impacts)) {
      lines.push(
        `- [${IMPACT_STATUS_META[impact.status].label.toUpperCase()}] ${IMPACT_CATEGORY_META[impact.category].label}: ${impact.title} — ${impact.explanation}`,
      );
      for (const action of impact.actions) {
        lines.push(`    · suggested action: ${action.title}${action.authority ? ` (${action.authority})` : ""}`);
      }
    }
    lines.push("");
  }

  lines.push("## Sources you may point the user to");
  for (const source of Object.values(SOURCES)) {
    lines.push(`- ${source.authority ?? source.label}: ${source.url}`);
  }

  return lines.join("\n");
}

/** Three short follow-ups, tailored to what is actually flagged. */
export function suggestFollowUps(impacts: Impact[] = []): string[] {
  const flagged = impacts.filter((i) => i.status !== "OK");
  const byCategory: Partial<Record<Impact["category"], string>> = {
    HEALTH_INSURANCE: "Which country should insure me?",
    SOCIAL_SECURITY: "Where do my pension rights build up?",
    TAX: "Where do I pay tax on my salary?",
    REGISTRATION: "Do I need to change my registration?",
    RESIDENCE: "What does my residence permit allow?",
    EMPLOYMENT: "What employment rules apply to me?",
    STUDENT_STATUS: "Does working affect my student benefits?",
  };

  const picked = flagged
    .map((i) => byCategory[i.category])
    .filter((q): q is string => Boolean(q))
    .slice(0, 3);

  while (picked.length < 3) {
    const fallback = ["What should I do first?", "Who can I ask in person?", "What changes if I move?"];
    const next = fallback.find((f) => !picked.includes(f));
    if (!next) break;
    picked.push(next);
  }
  return picked;
}

function place(city: string | undefined, country: keyof typeof COUNTRY_META): string {
  const name = COUNTRY_META[country].name;
  return city ? `${city}, ${name}` : name;
}

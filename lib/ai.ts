/**
 * AI layer — provider interface and implementations.
 *
 * Components call `getAI()` and nothing else. They never import a vendor SDK,
 * never see an API key, and never know whether the answer came from a model or
 * from the mock.
 *
 * Two implementations ship:
 *   httpAI — posts to /api/ask, where the key lives server-side.
 *   mockAI — canned answers, used when no key is configured or the call fails.
 *
 * `httpAI` degrades to `mockAI` on any failure, so the demo never breaks in
 * front of an audience.
 */
import { LIMITS, type AskRequestBody } from "./ai-prompt";
import type { Impact, UserProfile } from "./types";

export interface AskContext {
  profile?: UserProfile | null;
  impacts?: Impact[];
  /** Prior turns, oldest first. */
  history?: Array<{ role: "user" | "assistant"; text: string }>;
}

export interface AiAnswer {
  text: string;
  /** Follow-up questions the UI can offer as chips. */
  suggestions?: string[];
  /** True when the answer came from the mock rather than a model. */
  mocked: boolean;
  /** Set when the model was reachable but failed — the UI can surface it. */
  notice?: string;
  /** Optional profile fields to update based on AI tool calls. */
  profileUpdate?: Partial<UserProfile>;
}

export interface BorderlessAI {
  readonly id: string;
  ask(question: string, context?: AskContext): Promise<AiAnswer>;
  explainImpact(impact: Impact, profile?: UserProfile | null): Promise<string>;
}

/* ------------------------------ mock provider ----------------------------- */

const MOCK_SUGGESTIONS = [
  "What changes if I start working in Germany?",
  "Do I still need Dutch health insurance?",
  "Where do I pay tax?",
];

export const mockAI: BorderlessAI = {
  id: "mock",

  async ask(question, context) {
    await delay(350);
    const name = context?.profile?.name;
    const attention = (context?.impacts ?? []).filter((i) => i.status !== "OK").length;

    return {
      text: [
        `Ask Borderless has no model configured, so here is what the app already knows${name ? `, ${name}` : ""}.`,
        attention > 0
          ? `Your profile currently flags ${attention} area${attention === 1 ? "" : "s"} worth attention. The dashboard shows which, and the action centre has the concrete steps.`
          : "Your profile currently shows nothing that needs attention.",
        `With a model connected, a question like "${question.trim()}" is answered against your profile and the official sources behind each impact.`,
      ].join("\n\n"),
      suggestions: MOCK_SUGGESTIONS,
      mocked: true,
    };
  },

  async explainImpact(impact) {
    await delay(200);
    return `${impact.explanation}\n\n(A longer, personalised explanation appears here once a model is connected.)`;
  },
};

/* ------------------------------ http provider ----------------------------- */

/** Talks to the route handler, which holds the key. Falls back to the mock. */
export function createHttpAI(endpoint = "/api/ask"): BorderlessAI {
  async function post(body: AskRequestBody): Promise<AiAnswer | null> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // 503 = no key configured. Anything else is a real failure worth naming.
        if (response.status === 503) return null;
        const detail = await response.json().catch(() => null);
        return {
          text: "",
          mocked: true,
          notice: detail?.message ?? "The assistant is temporarily unavailable.",
        };
      }

      return (await response.json()) as AiAnswer;
    } catch {
      return { text: "", mocked: true, notice: "Could not reach the assistant." };
    }
  }

  return {
    id: "http",

    async ask(question, context) {
      const answer = await post({
        question,
        profile: context?.profile,
        impacts: context?.impacts,
        history: context?.history?.slice(-LIMITS.historyTurns),
        mode: "ask",
      });

      // Either no key, or a failure — fall back so the panel still says something.
      if (!answer || !answer.text) {
        const fallback = await mockAI.ask(question, context);
        return { ...fallback, notice: answer?.notice };
      }
      return answer;
    },

    async explainImpact(impact, profile) {
      const answer = await post({
        question: `Explain what "${impact.title}" means for me, and what I should do about it.`,
        profile,
        impacts: [impact],
        mode: "explain",
      });

      if (!answer || !answer.text) return mockAI.explainImpact(impact, profile);
      return answer.text;
    },
  };
}

/* --------------------------------- factory -------------------------------- */

let provider: BorderlessAI = createHttpAI();

/** The provider the app should use. Components call this, never a vendor SDK. */
export function getAI(): BorderlessAI {
  return provider;
}

/** Swap the implementation — for a different backend, or for tests. */
export function setAI(next: BorderlessAI): void {
  provider = next;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

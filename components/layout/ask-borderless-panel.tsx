"use client";

/**
 * "Ask Borderless".
 *
 * Talks only to the abstraction in `lib/ai.ts` — it has no idea which model
 * answers, or whether one answers at all. Deliberately not a chat-first
 * experience: it sits beside the product rather than being the product.
 */
import { useEffect, useRef, useState } from "react";
import { Info, Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAI, type AiAnswer } from "@/lib/ai";
import { LIMITS } from "@/lib/ai-prompt";
import type { Impact, UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";

interface Message {
  role: "user" | "assistant";
  text: string;
  proposedProfileUpdate?: Partial<UserProfile>;
  updateApplied?: boolean;
}

const INITIAL_SUGGESTIONS = [
  "What changes if I start working in Germany?",
  "Do I still need Dutch health insurance?",
  "Where do I pay tax?",
];

export function AskBorderlessPanel({
  open,
  onClose,
  profile,
  impacts,
}: {
  open: boolean;
  onClose: () => void;
  profile?: UserProfile | null;
  impacts?: Impact[];
}) {
  const { setProfile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  /** Set once we learn no model is configured, or a call failed. */
  const [notice, setNotice] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  function applyUpdate(index: number, update: Partial<UserProfile>) {
    if (profile) {
      setProfile({ ...profile, ...update });
      setMessages((msgs) =>
        msgs.map((msg, i) => (i === index ? { ...msg, updateApplied: true } : msg))
      );
    }
  }

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || pending) return;

    const history = messages.slice(-LIMITS.historyTurns);
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setPending(true);

    const answer: AiAnswer = await getAI().ask(trimmed, { profile, impacts, history });

    setMessages((m) => [...m, { role: "assistant", text: answer.text }]);
    if (answer.suggestions?.length) setSuggestions(answer.suggestions);
    if (answer.profileUpdate && profile) {
      setMessages((m) => [
        ...m, 
        { 
          role: "assistant", 
          text: "I noticed your situation changed. Would you like me to update your profile with this new information?",
          proposedProfileUpdate: answer.profileUpdate,
          updateApplied: false
        }
      ]);
    }
    setNotice(
      answer.notice ??
        (answer.mocked
          ? "No model is connected, so this is a placeholder answer. Set OPENAI_API_KEY in .env.local."
          : null),
    );
    setPending(false);
  }

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 transition-opacity md:bg-foreground/10",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-label="Ask Borderless"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold">Ask Borderless</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <X />
          </Button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <div className="space-y-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
              <p>
                Ask about your own situation. Answers use the profile and life areas on your
                dashboard.
              </p>
              <p className="text-xs">
                Your profile is sent to the language model to answer. Nothing is stored on a server.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground whitespace-pre-line"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {m.role === "user" ? (
                  m.text
                ) : (
                  <ReactMarkdown
                    components={{
                      a: ({ node: _, ...props }) => <a className="font-medium text-primary underline underline-offset-4 hover:text-primary/80" {...props} />,
                      p: ({ node: _, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                      ul: ({ node: _, ...props }) => <ul className="mb-3 list-inside list-disc space-y-1" {...props} />,
                      ol: ({ node: _, ...props }) => <ol className="mb-3 list-inside list-decimal space-y-1" {...props} />,
                      li: ({ node: _, ...props }) => <li className="" {...props} />,
                      strong: ({ node: _, ...props }) => <strong className="font-semibold text-foreground" {...props} />
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                )}
              </div>
              
              {m.proposedProfileUpdate && !m.updateApplied && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="ml-1"
                  onClick={() => applyUpdate(i, m.proposedProfileUpdate!)}
                >
                  Confirm Profile Update
                </Button>
              )}
              {m.proposedProfileUpdate && m.updateApplied && (
                <div className="ml-2 text-xs font-medium text-ok flex items-center gap-1.5">
                  <Sparkles className="size-3" />
                  Profile updated
                </div>
              )}
            </div>
          ))}

          {pending && (
            <div className="w-fit rounded-xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
              Thinking…
            </div>
          )}

          {notice && !pending && (
            <p className="flex items-start gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {notice}
            </p>
          )}

          {!pending && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2 border-t border-border px-5 py-4"
        >
          <Input
            value={input}
            maxLength={LIMITS.question}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your cross-border situation…"
            aria-label="Your question"
          />
          <Button type="submit" size="icon" disabled={pending || !input.trim()} aria-label="Send">
            <Send />
          </Button>
        </form>
      </aside>
    </>
  );
}

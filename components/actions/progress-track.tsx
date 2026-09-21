"use client";

/**
 * Progress track: one bar for all to-dos — green for done, rose for open —
 * with a pin on the line for every completed task, labelled with the day it
 * was ticked off. Collapsible, so it can step aside once it has been read.
 */
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { loadCompletionDates, saveCompletionDates } from "@/lib/storage";
import type { Action } from "@/lib/types";
import { cn } from "@/lib/utils";

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * Remembers when each task was completed. A task seen as done for the first
 * time is stamped with today; a task that is un-ticked loses its date.
 */
function useCompletionDates(done: Action[], ready: boolean): Record<string, string> {
  const [dates, setDates] = useState<Record<string, string>>({});
  const doneKey = done.map((a) => a.id).join("|");

  useEffect(() => {
    // Wait for the stored tasks, or the empty first render would wipe the dates.
    if (!ready) return;
    const stored = loadCompletionDates();
    const today = new Date().toISOString();
    const next: Record<string, string> = {};
    for (const action of done) next[action.id] = stored[action.id] ?? today;
    saveCompletionDates(next);
    setDates(next);
    // `doneKey` captures exactly the ids that matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey, ready]);

  return dates;
}

export function ProgressTrack({
  actions,
  done,
  ready,
}: {
  actions: Action[];
  done: Action[];
  ready: boolean;
}) {
  const [open, setOpen] = useState(true);
  const dates = useCompletionDates(done, ready);

  const total = actions.length;
  if (total === 0) return null;

  const percent = Math.round((done.length / total) * 100);
  const pins = done
    .filter((action) => dates[action.id])
    .sort((a, b) => dates[a.id].localeCompare(dates[b.id]))
    .map((action, i) => ({
      action,
      date: dates[action.id],
      // Each task is an equal slice of the bar; a pin sits at the end of its slice.
      position: ((i + 1) / total) * 100,
    }));

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Your progress</h2>
          <p className="text-sm text-muted-foreground">
            {done.length} of {total} to-dos completed
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-progress-done" aria-hidden />
            Done {percent}%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-progress-open-strong" aria-hidden />
            Open {100 - percent}%
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </div>
      </button>

      {/* Folded: a slim bar keeps the headline number visible. */}
      {!open && (
        <div className="px-5 pb-5">
          <Bar percent={percent} slim />
        </div>
      )}

      {open && (
        <div className="px-5 pb-5">
          {/* Desktop: pins sit on the line, labels alternate above and below. */}
          <div className="hidden py-16 sm:block">
            <div className="relative">
              <Bar percent={percent} />

              {pins.map(({ action, date, position }, i) => {
                const above = i % 2 === 0;
                const alignRight = position > 85;
                const alignLeft = position < 15;
                return (
                  <div
                    key={action.id}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${position}%` }}
                  >
                    <span className="block size-4 rounded-full border-[3px] border-progress-done-deep bg-card shadow-sm" />
                    <span
                      className={cn(
                        "absolute left-1/2 h-5 w-px bg-border",
                        above ? "bottom-full" : "top-full",
                      )}
                      aria-hidden
                    />
                    <div
                      className={cn(
                        "absolute w-40 text-xs",
                        above ? "bottom-[calc(100%+1.25rem)]" : "top-[calc(100%+1.25rem)]",
                        alignRight
                          ? "right-0 text-right"
                          : alignLeft
                            ? "left-0"
                            : "left-1/2 -translate-x-1/2 text-center",
                      )}
                    >
                      <p className="font-medium text-progress-done-deep">{shortDate(date)}</p>
                      <p className="line-clamp-2 leading-snug">{action.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phones: the bar, with the pins as a list underneath. */}
          <div className="space-y-4 sm:hidden">
            <Bar percent={percent} />
            <ul className="space-y-2 text-sm">
              {pins.map(({ action, date }) => (
                <li key={action.id} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-progress-done-deep"
                    aria-hidden
                  />
                  <span className="flex-1">{action.title}</span>
                  <span className="text-xs text-muted-foreground">{shortDate(date)}</span>
                </li>
              ))}
            </ul>
          </div>

          {done.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Circle className="size-4" aria-hidden />
              Tick off a to-do to place your first pin on the line.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function Bar({ percent, slim = false }: { percent: number; slim?: boolean }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${percent}% of to-dos completed`}
      className={cn(
        "flex w-full overflow-hidden rounded-full bg-progress-open",
        slim ? "h-1.5" : "h-3",
      )}
    >
      <div
        className="rounded-full bg-gradient-to-r from-progress-done to-progress-done-deep transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

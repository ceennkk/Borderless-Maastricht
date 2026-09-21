"use client";

/**
 * The invitation to plan, and the progress while it runs.
 *
 * Shown only before a plan exists — once there is one, the action centre
 * renders the plan instead. The card says what the agent will actually do,
 * because "plan my appointments" on its own does not tell anyone anything.
 */
import { CalendarRange, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PROMISES = [
  "Put them in the order that unblocks the next step",
  "Give each one a realistic date, allowing for waiting times",
  "Write the letters, in each authority's own language",
];

export function SchedulePlannerCard({
  taskCount,
  running,
  step,
  log,
  error,
  onRun,
}: {
  taskCount: number;
  running: boolean;
  step: string | null;
  log: string[];
  error: string | null;
  onRun: () => void;
}) {
  return (
    <Card className="space-y-4 border-primary/25 bg-surface p-6">
      <div className="flex gap-4">
        <CalendarRange className="size-6 shrink-0 text-primary" aria-hidden />
        <div className="space-y-1">
          <h2 className="font-semibold tracking-tight">
            Not sure what to do first?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            These {taskCount} task{taskCount === 1 ? "" : "s"} depend on each other — some have to
            wait for others, and a few take weeks. Let Borderless work out the sequence.
          </p>
        </div>
      </div>

      {running ? (
        <ul className="space-y-1.5 pl-10">
          {log.map((entry) => (
            <li key={entry} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-3.5 shrink-0 text-ok" aria-hidden />
              {entry}
            </li>
          ))}
          {step && (
            <li className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" aria-hidden />
              {step}
            </li>
          )}
        </ul>
      ) : (
        <ul className="space-y-1.5 pl-10">
          {PROMISES.map((promise) => (
            <li key={promise} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-ok" aria-hidden />
              {promise}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="pl-10 text-sm text-action-foreground">
          {error}
        </p>
      )}

      <div className="pl-10">
        <Button size="lg" onClick={onRun} disabled={running || taskCount === 0}>
          {running ? (
            <>
              <Loader2 className="animate-spin" />
              Working it out…
            </>
          ) : (
            "Build my plan"
          )}
        </Button>
        {!running && (
          <p className="mt-2 text-xs text-muted-foreground">
            Takes about 20 seconds. You can change anything afterwards.
          </p>
        )}
      </div>
    </Card>
  );
}

"use client";

/**
 * Personal action centre.
 *
 * Two states, deliberately never both at once:
 *
 *   no plan  → the tasks as a plain list, plus an invitation to plan them
 *   a plan   → the plan IS the list, ordered and dated, with the next step first
 *
 * Showing a schedule above an unordered copy of the same tasks was the thing
 * that made this page confusing, so the list is replaced rather than added to.
 */
import Link from "next/link";
import { ListChecks } from "lucide-react";

import { ActionList } from "./action-list";
import { ProgressTrack } from "./progress-track";
import { SchedulePlannerCard } from "./schedule-planner";
import { ScheduleTimeline } from "./schedule-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useActions } from "@/hooks/use-actions";
import { useProfile } from "@/hooks/use-profile";
import { useSchedule } from "@/hooks/use-schedule";

export function ActionCenter() {
  const { profile, impacts } = useProfile();
  const { actions, open, done, toggle, ready } = useActions(impacts);
  const schedule = useSchedule(profile, open);

  // A step that is in the plan shows its own completed state inline, so it must
  // not also appear under "Completed" — that was the duplication this rework
  // set out to remove. Only tasks finished before planning are listed there.
  const plannedIds = new Set(schedule.plan?.items.map((i) => i.actionId) ?? []);
  const doneOutsidePlan = done.filter((a) => !plannedIds.has(a.id));

  if (actions.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title="My To-Dos" />
        <EmptyState
          icon={<ListChecks className="size-8" />}
          title="No to-dos right now"
          description="You're all caught up."
          action={
            <Button asChild variant="outline">
              <Link href="/simulator">Plan a change</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="My To-Dos" />

      {schedule.plan ? (
        <>
          <ProgressTrack actions={actions} done={done} ready={ready} />
          <ScheduleTimeline
            plan={schedule.plan}
            actions={actions}
            onToggle={toggle}
            onReplan={schedule.run}
          />
        </>
      ) : (
        <>
          {open.length > 0 && (
            <SchedulePlannerCard
              taskCount={open.length}
              running={schedule.running}
              step={schedule.step}
              log={schedule.log}
              error={schedule.error}
              onRun={schedule.run}
            />
          )}

          <ProgressTrack actions={actions} done={done} ready={ready} />

          {open.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">To do</h2>
              <ActionList actions={open} onToggle={toggle} />
            </section>
          )}
        </>
      )}

      {doneOutsidePlan.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">
            Completed
          </h2>
          <ActionList actions={doneOutsidePlan} onToggle={toggle} />
        </section>
      )}
    </div>
  );
}

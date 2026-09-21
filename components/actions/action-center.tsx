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
import { SchedulePlannerCard } from "./schedule-planner";
import { ScheduleTimeline } from "./schedule-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActions } from "@/hooks/use-actions";
import { useProfile } from "@/hooks/use-profile";
import { useSchedule } from "@/hooks/use-schedule";

export function ActionCenter() {
  const { profile, impacts } = useProfile();
  const { actions, open, done, toggle } = useActions(impacts);
  const schedule = useSchedule(profile, open);

  const progress = actions.length === 0 ? 0 : (done.length / actions.length) * 100;

  // A step that is in the plan shows its own completed state inline, so it must
  // not also appear under "Completed" — that was the duplication this rework
  // set out to remove. Only tasks finished before planning are listed there.
  const plannedIds = new Set(schedule.plan?.items.map((i) => i.actionId) ?? []);
  const doneOutsidePlan = done.filter((a) => !plannedIds.has(a.id));

  if (actions.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Your actions"
          description="The concrete steps that follow from your situation."
        />
        <EmptyState
          icon={<ListChecks className="size-8" />}
          title="No actions right now"
          description="Nothing in your current situation needs doing. Try the simulator to see what a change would add."
          action={
            <Button asChild variant="outline">
              <Link href="/simulator">Open the simulator</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your actions"
        description={
          schedule.plan
            ? "Work down the list. Open a step to see why it matters and who to contact."
            : "The concrete steps that follow from your situation. Open one to see why it matters and who to contact."
        }
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {done.length} of {actions.length} done
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {schedule.plan ? (
        <ScheduleTimeline
          plan={schedule.plan}
          actions={actions}
          onToggle={toggle}
          onReplan={schedule.run}
        />
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
          <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">Completed</h2>
          <ActionList actions={doneOutsidePlan} onToggle={toggle} />
        </section>
      )}
    </div>
  );
}

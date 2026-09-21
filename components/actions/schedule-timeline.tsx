"use client";

/**
 * The plan, as the action centre's only list.
 *
 * The first unfinished step is pulled out and emphasised, because the question
 * a user actually arrives with is "what do I do now?", not "show me everything".
 * The rest follow in order so the agent's work is still visible at a glance.
 */
import { useState } from "react";
import { CalendarPlus, Info, RotateCcw } from "lucide-react";

import { BookingPrepPanel } from "./booking-prep-panel";
import { EmailDraftPanel } from "./email-draft-panel";
import { ScheduleStep } from "./schedule-step";
import { Button } from "@/components/ui/button";
import { usePersonalDetails } from "@/hooks/use-personal-details";
import { getAuthority, getBookingService } from "@/lib/authorities";
import { downloadIcs } from "@/lib/scheduling";
import type { Action, ScheduleItem, SchedulePlan } from "@/lib/types";

export function ScheduleTimeline({
  plan,
  actions,
  onToggle,
  onReplan,
}: {
  plan: SchedulePlan;
  /** All tasks, so each step can show its detail and completion. */
  actions: Action[];
  onToggle: (actionId: string) => void;
  onReplan: () => void;
}) {
  const [openDraft, setOpenDraft] = useState<ScheduleItem | null>(null);
  const [openBooking, setOpenBooking] = useState<ScheduleItem | null>(null);
  const { details, update } = usePersonalDetails();

  const byId = new Map(actions.map((a) => [a.id, a]));
  const steps = plan.items.map((item) => ({ item, action: byId.get(item.actionId) }));

  const nextIndex = steps.findIndex(({ action }) => !action?.completed);
  const bookingAuthority = openBooking?.authorityId ? getAuthority(openBooking.authorityId) : undefined;
  const bookingService = getBookingService(openBooking?.authorityId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Your plan</h2>
          {/* The per-step reasoning carries the "why"; a summary on top of it
              only repeats the list back at the reader. */}
          <p className="text-sm text-muted-foreground">
            Top to bottom. Each step is dated to leave room for the waiting time.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={onReplan}>
            <RotateCcw />
            Re-plan
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadIcs(plan)}>
            <CalendarPlus />
            Add to calendar
          </Button>
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map(({ item, action }, i) => (
          <li key={`${item.actionId}-${item.order}`}>
            <ScheduleStep
              item={item}
              action={action}
              emphasis={i === nextIndex}
              onToggle={() => onToggle(item.actionId)}
              onOpenDraft={() => setOpenDraft(item)}
              onOpenBooking={() => setOpenBooking(item)}
            />
          </li>
        ))}
      </ol>

      {/* Only shown when the planner genuinely could not settle something. */}
      {plan.caveats.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-dashed border-border bg-surface px-4 py-3">
          {plan.caveats.map((c) => (
            <p key={c} className="text-sm text-muted-foreground">
              · {c}
            </p>
          ))}
        </div>
      )}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          Dates are planning targets based on typical waiting times, not confirmed appointments.
          Borderless does not contact anyone on your behalf — you book and send yourself.
        </span>
      </p>

      {openBooking && bookingAuthority && bookingService && (
        <BookingPrepPanel
          authority={bookingAuthority}
          service={bookingService}
          details={details}
          onUpdateDetails={update}
          onClose={() => setOpenBooking(null)}
        />
      )}

      {openDraft?.draft && (
        <EmailDraftPanel
          item={openDraft}
          draft={openDraft.draft}
          details={details}
          onUpdateDetails={update}
          onClose={() => setOpenDraft(null)}
        />
      )}
    </div>
  );
}

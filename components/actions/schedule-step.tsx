"use client";

/**
 * One step of the plan — and the task itself.
 *
 * The schedule replaces the task list rather than sitting beside it, so this
 * carries everything: the ordering and dates from the planner, the checkbox and
 * detail from the action, and the draft and booking affordances.
 */
import { useState } from "react";
import {
  CalendarClock,
  Check,
  ChevronDown,
  ExternalLink,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Send,
} from "lucide-react";

import { ActionDetail } from "./action-detail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CHANNEL_META, getAuthority, getBookingService } from "@/lib/authorities";
import type { Action, ContactChannel, ScheduleItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const CHANNEL_ICON: Record<ContactChannel, typeof Monitor> = {
  ONLINE: Monitor,
  IN_PERSON: MapPin,
  POST: Send,
  PHONE: Phone,
  EMAIL: Mail,
};

export function ScheduleStep({
  item,
  action,
  emphasis = false,
  onToggle,
  onOpenDraft,
  onOpenBooking,
}: {
  item: ScheduleItem;
  /** The underlying task, when we can match it. Carries detail and completion. */
  action?: Action;
  /** True for the one step the user should do next. */
  emphasis?: boolean;
  onToggle: () => void;
  onOpenDraft: () => void;
  onOpenBooking: () => void;
}) {
  const [open, setOpen] = useState(false);

  const authority = item.authorityId ? getAuthority(item.authorityId) : undefined;
  const service = getBookingService(item.authorityId);
  const channel = CHANNEL_META[item.channel];
  const ChannelIcon = CHANNEL_ICON[item.channel];
  const done = action?.completed ?? false;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors",
        emphasis && "border-primary/40 shadow-sm",
        done && "bg-surface",
      )}
    >
      {emphasis && (
        <p className="border-b border-primary/25 bg-secondary/50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-primary">
          Do this next
        </p>
      )}

      <div className={cn("flex gap-3 p-5", emphasis && "sm:gap-4")}>
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={`Mark "${item.title}" as ${done ? "not done" : "done"}`}
          onClick={onToggle}
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
            done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-card hover:border-primary",
          )}
        >
          {done && <Check className="size-3.5" aria-hidden />}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p
              className={cn(
                "font-medium leading-snug",
                emphasis && "text-lg",
                done && "text-muted-foreground line-through",
              )}
            >
              <span className="mr-2 text-muted-foreground">{item.order}.</span>
              {item.title}
            </p>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                emphasis && !done
                  ? "border-primary/30 bg-secondary text-primary"
                  : "border-border bg-surface text-muted-foreground",
              )}
            >
              <CalendarClock className="size-3.5" aria-hidden />
              by {formatDate(item.doBy) ?? item.doBy}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{item.reasoning}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ChannelIcon className="size-3.5" aria-hidden />
              {channel.label}
            </span>
            {authority && <span>{authority.name}</span>}
            {item.appointmentRequired && (
              <span className="font-medium text-check-foreground">Appointment needed</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {item.draft && (
              <Button size="sm" variant={emphasis ? "default" : "outline"} onClick={onOpenDraft}>
                <Mail />
                Review draft
              </Button>
            )}
            {service ? (
              <Button size="sm" variant={emphasis && !item.draft ? "default" : "outline"} onClick={onOpenBooking}>
                <CalendarClock />
                Prepare booking
              </Button>
            ) : (
              authority?.bookingUrl && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={authority.bookingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink />
                    Open {authority.name}
                  </a>
                </Button>
              )
            )}

            {action && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="text-muted-foreground"
              >
                <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
                {open ? "Less" : "Why this matters"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {open && action && (
        <div className="border-t border-border bg-surface/60 px-5 py-5">
          <ActionDetail action={action} />
        </div>
      )}
    </Card>
  );
}

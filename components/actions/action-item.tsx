"use client";

/** One task, collapsed to a checkbox row and expandable to full detail. */
import { useState } from "react";
import { Building2, CalendarClock, Check, ChevronDown } from "lucide-react";

import { ActionDetail } from "./action-detail";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Card } from "@/components/ui/card";
import { IMPACT_CATEGORY_META } from "@/lib/constants";
import type { Action } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function ActionItem({ action, onToggle }: { action: Action; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const deadline = formatDate(action.deadline);

  return (
    <Card className={cn("overflow-hidden", action.completed && "bg-surface")}>
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <button
          type="button"
          role="checkbox"
          aria-checked={action.completed}
          aria-label={`Mark "${action.title}" as ${action.completed ? "not done" : "done"}`}
          onClick={onToggle}
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
            action.completed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-card hover:border-primary",
          )}
        >
          {action.completed && <Check className="size-3.5" aria-hidden />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex flex-1 items-start justify-between gap-3 text-left"
        >
          <div className="space-y-1">
            <p className={cn("font-medium leading-snug", action.completed && "text-muted-foreground line-through")}>
              {action.title}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">{action.description}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CategoryIcon category={action.category} className="size-3.5" />
                {IMPACT_CATEGORY_META[action.category].label}
              </span>
              {action.authority && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5" aria-hidden />
                  {action.authority}
                </span>
              )}
              {deadline && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-3.5" aria-hidden />
                  {deadline}
                </span>
              )}
            </div>
          </div>

          <ChevronDown
            className={cn("mt-1 size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface/60 px-4 py-5 sm:px-5">
          <ActionDetail action={action} />
        </div>
      )}
    </Card>
  );
}

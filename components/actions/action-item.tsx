"use client";

/** One task, collapsed to a checkbox row and expandable to full detail. */
import { useState } from "react";
import { Building2, CalendarClock, Check, ChevronDown, FileText } from "lucide-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { SourceLink } from "@/components/shared/source-link";
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

      {open && <ActionDetail action={action} />}
    </Card>
  );
}

function ActionDetail({ action }: { action: Action }) {
  return (
    <div className="space-y-5 border-t border-border bg-surface/60 px-4 py-5 sm:px-5 sm:pl-13">
      {action.why && (
        <Section title="Why this matters">
          <p className="text-sm leading-relaxed text-muted-foreground">{action.why}</p>
        </Section>
      )}

      {action.steps && action.steps.length > 0 && (
        <Section title="What to do">
          <ol className="space-y-2">
            {action.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {action.documents && action.documents.length > 0 && (
        <Section title="Documents">
          <ul className="flex flex-wrap gap-2">
            {action.documents.map((doc) => (
              <li
                key={doc}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs"
              >
                <FileText className="size-3.5 text-muted-foreground" aria-hidden />
                {doc}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {action.authority && (
        <Section title="Authority">
          <p className="text-sm text-muted-foreground">{action.authority}</p>
        </Section>
      )}

      {action.source && (
        <Section title="Official source">
          <SourceLink source={action.source} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

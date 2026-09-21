"use client";

/**
 * A glance at the open tasks, on the dashboard.
 *
 * The attention banner above it says *which areas* are affected; this says
 * *what to actually do*. The whole card is a link — someone scanning the
 * dashboard should reach their tasks without hunting for the nav.
 */
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, ListChecks } from "lucide-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Action } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const PREVIEW_COUNT = 3;

export function TodoSummary({ open, total }: { open: Action[]; total: number }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (total === 0) return null;

  if (open.length === 0) {
    return (
      <Card className="flex items-center gap-3 border-ok/25 bg-ok-surface p-5">
        <CheckCircle2 className="size-5 shrink-0 text-ok" aria-hidden />
        <p className="text-sm font-medium text-ok-foreground">
          All {total} task{total === 1 ? "" : "s"} done.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-200">
      <button 
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-surface/50"
        style={{ borderBottom: isExpanded ? '1px solid hsl(var(--border))' : 'none' }}
      >
        <div className="flex items-center gap-2">
          <ListChecks className="size-5 text-primary" />
          <h2 className="font-semibold tracking-tight">Your To-Dos</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {open.length} open
          </span>
          {isExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <>
          <div className="flex-1 p-0 animate-in slide-in-from-top-2 fade-in duration-200">
            <ul className="divide-y divide-border">
              {open.slice(0, PREVIEW_COUNT).map((action) => {
                const deadline = formatDate(action.deadline);
                return (
                  <li key={action.id} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-surface/50">
                    <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-muted" aria-hidden />
                    <div className="min-w-0 flex-1 space-y-1 text-left">
                      <p className="truncate text-sm font-medium">{action.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CategoryIcon category={action.category} className="size-3" />
                        <span>{deadline || "No deadline"}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-border bg-surface/30 p-3 animate-in fade-in duration-200">
            <Button asChild variant="ghost" className="w-full justify-between text-muted-foreground hover:bg-surface hover:text-foreground">
              <Link href="/actions">
                View all {open.length} to-dos
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

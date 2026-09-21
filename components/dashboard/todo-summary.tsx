"use client";

/**
 * A glance at the open tasks, on the dashboard.
 *
 * The attention banner above it says *which areas* are affected; this says
 * *what to actually do*. The whole card is a link — someone scanning the
 * dashboard should reach their tasks without hunting for the nav.
 */
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { CategoryIcon } from "@/components/shared/category-icon";
import { Card } from "@/components/ui/card";
import type { Action } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const PREVIEW_COUNT = 3;

export function TodoSummary({ open, total }: { open: Action[]; total: number }) {
  const done = total - open.length;

  if (total === 0) return null;

  if (open.length === 0) {
    return (
      <Card className="flex items-center gap-3 rounded-none border-x-0 border-ok/25 bg-ok-surface p-4">
        <CheckCircle2 className="size-5 shrink-0 text-ok" aria-hidden />
        <p className="text-sm font-medium text-ok-foreground">
          All {total} task{total === 1 ? "" : "s"} done.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-none">
      <Link href="/actions" className="block transition-colors hover:bg-surface/60">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-baseline gap-2">
            <h2 className="font-semibold tracking-tight">Your to-dos</h2>
            <span className="text-sm text-muted-foreground">
              {open.length} open{done > 0 && `, ${done} done`}
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
            Open
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>

        <ul className="divide-y divide-border">
          {open.slice(0, PREVIEW_COUNT).map((action) => {
            const deadline = formatDate(action.deadline);
            return (
              <li key={action.id} className="flex items-center gap-3 px-5 py-2.5">
                <span
                  aria-hidden
                  className="size-4 shrink-0 rounded-md border border-input bg-card"
                />
                <CategoryIcon category={action.category} className="size-4 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">{action.title}</span>
                {deadline && (
                  <span className="shrink-0 text-xs text-muted-foreground">{deadline}</span>
                )}
              </li>
            );
          })}
        </ul>

        {open.length > PREVIEW_COUNT && (
          <p className="px-5 py-2.5 text-sm text-muted-foreground">
            + {open.length - PREVIEW_COUNT} more
          </p>
        )}
      </Link>
    </Card>
  );
}

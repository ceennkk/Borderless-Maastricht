import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { SituationRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/** CURRENT SITUATION → PROPOSED SITUATION, side by side. */
export function SituationCompare({ rows }: { rows: SituationRow[] }) {
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
      <SituationColumn title="Current" rows={rows} field="current" />

      <div className="flex items-center justify-center">
        <span className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground">
          <ArrowRight className="size-4 md:rotate-0" aria-hidden />
        </span>
      </div>

      <SituationColumn title="Proposed" rows={rows} field="proposed" highlight />
    </div>
  );
}

function SituationColumn({
  title,
  rows,
  field,
  highlight = false,
}: {
  title: string;
  rows: SituationRow[];
  field: "current" | "proposed";
  highlight?: boolean;
}) {
  return (
    <Card className={cn("p-5", highlight ? "border-primary/30 bg-secondary/40" : "bg-card")}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <dl className="space-y-3">
        {rows.map((row) => {
          const changed = highlight && row.changed;
          return (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd
                className={cn(
                  "text-right text-sm font-medium",
                  changed && "rounded-md bg-primary/10 px-1.5 py-0.5 text-primary",
                )}
              >
                {row[field]}
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}

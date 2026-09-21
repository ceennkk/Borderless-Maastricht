import type { SituationRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/** CURRENT SITUATION → PROPOSED SITUATION, side by side. */
export function SituationCompare({ rows }: { rows: SituationRow[] }) {
  return (
    <div className="overflow-hidden border border-border bg-card">
      <div className="grid grid-cols-[7rem_1fr_1fr] border-b border-border bg-surface px-4 py-2.5 text-xs font-semibold text-muted-foreground sm:grid-cols-[10rem_1fr_1fr] sm:px-5">
        <span>Detail</span>
        <span>Current</span>
        <span>Proposed</span>
      </div>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[7rem_1fr_1fr] items-center px-4 py-3 text-sm sm:grid-cols-[10rem_1fr_1fr] sm:px-5"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd>{row.current}</dd>
            <dd className={cn("font-medium", row.changed && "text-primary")}>{row.proposed}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

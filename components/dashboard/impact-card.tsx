import { CategoryIcon } from "@/components/shared/category-icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { IMPACT_CATEGORY_META } from "@/lib/constants";
import type { Impact } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCENT: Record<Impact["status"], string> = {
  OK: "before:bg-ok",
  CHECK: "before:bg-check",
  ACTION: "before:bg-action",
};

/** One life area, one card. The status is the first thing you read. */
export function ImpactCard({ impact }: { impact: Impact }) {
  const meta = IMPACT_CATEGORY_META[impact.category];

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col gap-4 overflow-hidden rounded-none border-0 bg-card p-6",
        "border-b border-r border-border last:border-b-0",
        "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
        ACCENT[impact.status],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <CategoryIcon category={impact.category} />
          <span className="text-sm font-medium text-foreground">{meta.label}</span>
        </div>
        <StatusBadge status={impact.status} showIcon={false} />
      </div>

      <div className="space-y-2">
        <p className="font-display text-xl leading-snug">{impact.title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{impact.explanation}</p>
      </div>

      {impact.actions.length > 0 && (
        <p className="mt-auto pt-1 text-xs font-medium text-muted-foreground">
          {impact.actions.length} action{impact.actions.length === 1 ? "" : "s"} suggested
        </p>
      )}
    </Card>
  );
}

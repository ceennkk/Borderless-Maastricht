import { CategoryIcon } from "@/components/shared/category-icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { IMPACT_CATEGORY_META } from "@/lib/constants";
import type { Impact } from "@/lib/types";

/** One life area, one card. The status is the first thing you read. */
export function ImpactCard({ impact }: { impact: Impact }) {
  const meta = IMPACT_CATEGORY_META[impact.category];

  return (
    <Card
className="flex h-full flex-col gap-4 p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <CategoryIcon category={impact.category} />
          <span className="text-sm font-medium text-foreground">{meta.label}</span>
        </div>
        <StatusBadge status={impact.status} showIcon={false} />
      </div>

      <span aria-hidden className="border-line-muted -mx-5 block h-px" />

      <div className="space-y-2">
        <p className="text-base font-semibold leading-snug">{impact.title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{impact.explanation}</p>
      </div>

      {impact.actions.length > 0 && (
        <p className="mt-auto pt-1 text-xs font-medium text-muted-foreground">
          {impact.actions.length} to-do{impact.actions.length === 1 ? "" : "s"} suggested
        </p>
      )}
    </Card>
  );
}

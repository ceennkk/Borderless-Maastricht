import { CountryChip } from "@/components/shared/country-badge";
import { SourceLink } from "@/components/shared/source-link";
import { Card } from "@/components/ui/card";
import { OPPORTUNITY_CATEGORY_META } from "@/lib/constants";
import type { Opportunity } from "@/lib/types";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Card className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {OPPORTUNITY_CATEGORY_META[opportunity.category].label}
        </span>
        {opportunity.countries && (
          <span className="flex gap-1.5">
            {opportunity.countries.map((c) => (
              <CountryChip key={c} country={c} className="text-xs" />
            ))}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="font-medium leading-snug">{opportunity.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{opportunity.description}</p>
      </div>

      <div className="mt-auto space-y-3 pt-2">
        <div className="rounded-lg bg-surface px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Who it is for
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{opportunity.eligibility}</p>
        </div>
        <SourceLink source={opportunity.source} />
      </div>
    </Card>
  );
}

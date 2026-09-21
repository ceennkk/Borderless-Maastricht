import { CategoryIcon } from "@/components/shared/category-icon";
import { SourceLink } from "@/components/shared/source-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { IMPACT_CATEGORY_META } from "@/lib/constants";
import type { Impact } from "@/lib/types";

/** The list of affected areas produced by a simulation. */
export function ImpactResults({ impacts }: { impacts: Impact[] }) {
  return (
    <ul className="space-y-3">
      {impacts.map((impact) => (
        <li key={impact.id}>
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CategoryIcon category={impact.category} className="text-muted-foreground" />
                <span className="font-medium">{IMPACT_CATEGORY_META[impact.category].label}</span>
              </div>
              <StatusBadge status={impact.status} />
            </div>

            <p className="mt-3 text-sm font-medium">{impact.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {impact.explanation}
            </p>

            {impact.sources.length > 0 && (
              <div className="mt-4 space-y-1.5 border-t border-border pt-3">
                {impact.sources.map((source) => (
                  <SourceLink key={source.url} source={source} />
                ))}
              </div>
            )}
          </Card>
        </li>
      ))}
    </ul>
  );
}

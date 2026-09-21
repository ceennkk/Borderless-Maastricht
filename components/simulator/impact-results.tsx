import { CategoryIcon } from "@/components/shared/category-icon";
import { SourceLink } from "@/components/shared/source-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { IMPACT_CATEGORY_META } from "@/lib/constants";
import type { Impact } from "@/lib/types";

/** The list of affected areas produced by a simulation. */
export function ImpactResults({ impacts }: { impacts: Impact[] }) {
  return (
    <ul className="divide-y divide-border border border-border bg-card">
      {impacts.map((impact) => (
        <li key={impact.id} className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[11rem_1fr_auto] sm:items-start">
            <div className="flex items-center gap-2.5">
              <CategoryIcon category={impact.category} className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{IMPACT_CATEGORY_META[impact.category].label}</span>
            </div>

            <div>
              <p className="font-semibold">{impact.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {impact.explanation}
              </p>

              {impact.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {impact.sources.map((source) => (
                    <SourceLink key={source.url} source={source} />
                  ))}
                </div>
              )}
            </div>

            <div className="sm:justify-self-end">
              <StatusBadge status={impact.status} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

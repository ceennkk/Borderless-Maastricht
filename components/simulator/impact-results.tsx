import { CategoryIcon } from "@/components/shared/category-icon";
import { SourceLink } from "@/components/shared/source-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { IMPACT_CATEGORY_META } from "@/lib/constants";
import type { Impact } from "@/lib/types";

/** The list of affected areas produced by a simulation. */
export function ImpactResults({ impacts }: { impacts: Impact[] }) {
  const needingAttention = impacts.filter((impact) => impact.status !== "OK");
  const unchanged = impacts.filter((impact) => impact.status === "OK");

  return (
    <div className="border border-border bg-card">
      <ImpactList impacts={needingAttention} />
      {unchanged.length > 0 && (
        <details className="group border-t border-border">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface sm:px-6">
            <span className="inline-flex items-center gap-2">
              <span className="text-xs transition-transform group-open:rotate-90">›</span>
              {unchanged.length} area{unchanged.length === 1 ? "" : "s"} unchanged
            </span>
          </summary>
          <ImpactList impacts={unchanged} />
        </details>
      )}
    </div>
  );
}

function ImpactList({ impacts }: { impacts: Impact[] }) {
  return (
    <ul className="divide-y divide-border">
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

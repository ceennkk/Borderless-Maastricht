"use client";

/**
 * One opportunity, compact.
 *
 * Seven cards each showing a category, two country chips, a title, two
 * sentences of description, an eligibility box and a two-line source link is a
 * wall of text nobody reads. At rest a card answers only two questions — what
 * is it, and is it for me — and the rest waits behind a click.
 */
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { CountryChip } from "@/components/shared/country-badge";
import { SourceLink } from "@/components/shared/source-link";
import { Card } from "@/components/ui/card";
import { OPPORTUNITY_CATEGORY_META } from "@/lib/constants";
import type { Opportunity } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden rounded-none border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-surface/60"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider">
              {OPPORTUNITY_CATEGORY_META[opportunity.category].label}
            </span>
            {opportunity.countries?.map((c) => (
              <CountryChip key={c} country={c} className="text-xs font-normal" />
            ))}
          </div>

          <p className="font-medium leading-snug">{opportunity.title}</p>
          <p className="line-clamp-1 text-sm text-muted-foreground">{opportunity.eligibility}</p>
        </div>

        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-border bg-surface/60 px-4 py-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {opportunity.description}
          </p>
          <SourceLink source={opportunity.source} />
        </div>
      )}
    </Card>
  );
}

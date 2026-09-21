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
import {
  Briefcase,
  ChevronDown,
  GraduationCap,
  Landmark,
  TrainFront,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { CountryChip } from "@/components/shared/country-badge";
import { SourceLink } from "@/components/shared/source-link";
import { Card } from "@/components/ui/card";
import { OPPORTUNITY_CATEGORY_META } from "@/lib/constants";
import type { Opportunity, OpportunityCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<OpportunityCategory, LucideIcon> = {
  TRANSPORT: TrainFront,
  STUDENT: GraduationCap,
  WORK: Briefcase,
  FINANCE: Wallet,
  SERVICES: Landmark,
  COMMUNITY: Users,
};

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const [open, setOpen] = useState(false);
  const category = OPPORTUNITY_CATEGORY_META[opportunity.category];
  const Icon = CATEGORY_ICON[opportunity.category];

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-shadow hover:shadow-md",
        open && "shadow-md",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-40 w-full items-start gap-4 p-5 text-left"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="size-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">{category.label}</span>
            {opportunity.countries && opportunity.countries.length > 0 && (
              <span className="flex items-center gap-2.5">
                {opportunity.countries.map((c) => (
                  <CountryChip key={c} country={c} className="text-xs text-muted-foreground" />
                ))}
              </span>
            )}
          </div>

          <p className="line-clamp-2 font-semibold leading-snug">{opportunity.title}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {opportunity.eligibility}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "mt-2.5 size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-dashed border-border px-5 py-4 pl-[4.75rem]">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {opportunity.description}
          </p>
          <SourceLink source={opportunity.source} />
        </div>
      )}
    </Card>
  );
}

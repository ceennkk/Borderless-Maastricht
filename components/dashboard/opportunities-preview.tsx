import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OPPORTUNITY_CATEGORY_META } from "@/lib/constants";
import type { Opportunity } from "@/lib/types";

/** A short taste of the opportunities page, shown at the foot of the dashboard. */
export function OpportunitiesPreview({ opportunities }: { opportunities: Opportunity[] }) {
  const shown = opportunities.slice(0, 3);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Opportunities for you</h2>
          <p className="text-sm text-muted-foreground">
            Not obligations — things you could benefit from.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/opportunities">
            See all
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 border-t border-border sm:grid-cols-3">
        {shown.map((o) => (
          <Card key={o.id} className="flex h-full flex-col gap-2 rounded-none border-0 bg-transparent px-0 py-5">
            <span className="text-xs font-medium text-muted-foreground">
              {OPPORTUNITY_CATEGORY_META[o.category].label}
            </span>
            <p className="font-medium leading-snug">{o.title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{o.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

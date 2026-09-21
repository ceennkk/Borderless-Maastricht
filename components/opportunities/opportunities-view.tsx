"use client";

/**
 * Opportunities page.
 *
 * The split between obligations and benefits is the point of this page, so it
 * is stated at the top rather than implied by layout.
 */
import Link from "next/link";
import { ArrowRight, Gift, ShieldAlert } from "lucide-react";

import { OpportunityCard } from "./opportunity-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { getOpportunities } from "@/lib/opportunities";
import { countNeedingAttention } from "@/lib/rules";

export function OpportunitiesView() {
  const { profile, impacts } = useProfile();
  const opportunities = getOpportunities(profile);
  const attention = countNeedingAttention(impacts);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Opportunities for you"
        description="Living across a border is not only paperwork. These are things you could benefit from."
      />

      {/* The distinction, stated plainly. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex gap-4 border-border bg-surface p-5">
          <ShieldAlert className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What you need to know
            </p>
            <p className="text-sm text-muted-foreground">
              Obligations and things to check —{" "}
              {attention > 0
                ? `${attention} currently need your attention.`
                : "nothing needs your attention right now."}
            </p>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/dashboard">
                Go to dashboard
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="flex gap-4 border-primary/25 bg-secondary/40 p-5">
          <Gift className="size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              What you could benefit from
            </p>
            <p className="text-sm text-muted-foreground">
              Nothing below is required. {opportunities.length} suggestions match your profile.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
    </div>
  );
}

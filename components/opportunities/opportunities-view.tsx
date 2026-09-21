"use client";

/**
 * Opportunities page.
 *
 * The obligations/benefits distinction is the point of this page, but it needs
 * one line, not two cards competing with the list underneath.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { OpportunityCard } from "./opportunity-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { getOpportunities } from "@/lib/opportunities";
import { countNeedingAttention } from "@/lib/rules";

export function OpportunitiesView() {
  const { profile, impacts } = useProfile();
  const opportunities = getOpportunities(profile);
  const attention = countNeedingAttention(impacts);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities for you"
        description="None of this is required. Things you could benefit from, not things you have to do."
      />

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">
          Looking for what you <strong className="font-medium text-foreground">have</strong> to do?
        </span>
        {attention > 0 && (
          <span className="text-muted-foreground">{attention} areas need attention.</span>
        )}
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href="/dashboard">
            Dashboard
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {opportunities.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
    </div>
  );
}

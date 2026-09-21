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
      <PageHeader title="Benefits & Tips" />

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border bg-muted/60 px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          Looking for required tasks?
        </span>
        {attention > 0 && (
          <span className="text-muted-foreground">({attention} areas need attention)</span>
        )}
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href="/dashboard">
            My Status
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="grid items-start gap-3 md:grid-cols-2">
        {opportunities.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
    </div>
  );
}

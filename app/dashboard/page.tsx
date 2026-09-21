"use client";

/**
 * Dashboard — the overview of the user's cross-border life.
 * Thin by design: it composes dashboard components and reads from hooks.
 */
import Link from "next/link";
import { ArrowRight, Split } from "lucide-react";


import { CrossBorderHeader } from "@/components/dashboard/cross-border-header";
import { ImpactGrid } from "@/components/dashboard/impact-grid";
import { TodoSummary } from "@/components/dashboard/todo-summary";
import { OpportunitiesPreview } from "@/components/dashboard/opportunities-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useActions } from "@/hooks/use-actions";
import { useProfile } from "@/hooks/use-profile";
import { getOpportunities } from "@/lib/opportunities";

export default function DashboardPage() {
  const { profile, impacts, isDemo, ready } = useProfile();
  const { actions, open } = useActions(impacts);
  const opportunities = getOpportunities(profile);

  return (
    <div className="space-y-10">
      {ready && isDemo && <DemoNotice />}

      <CrossBorderHeader profile={profile} />



      <TodoSummary open={open} total={actions.length} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Your life areas</h2>
        <ImpactGrid impacts={impacts} />
      </section>

      <Card className="flex flex-col gap-4 bg-surface p-6 sm:flex-row sm:items-center">
        <Split className="size-6 shrink-0 text-primary" aria-hidden />
        <div className="flex-1">
          <p className="font-medium">Considering a change?</p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/simulator">
            Plan a change
            <ArrowRight />
          </Link>
        </Button>
      </Card>

      <OpportunitiesPreview opportunities={opportunities} />
    </div>
  );
}

function DemoNotice() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-secondary bg-secondary/60 px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">
        Demo profile: <strong className="font-medium text-foreground">Alex</strong>
      </span>
      <Button asChild variant="link" size="sm" className="h-auto p-0">
        <Link href="/onboarding">Create your own profile</Link>
      </Button>
    </div>
  );
}

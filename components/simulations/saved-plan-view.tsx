"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ListChecks } from "lucide-react";
import Link from "next/link";

import { ImpactResults } from "@/components/simulator/impact-results";
import { SituationCompare } from "@/components/simulator/situation-compare";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LIFE_CHANGE_META } from "@/lib/constants";
import { buildSituationRows } from "@/lib/rules";
import { useProfile } from "@/hooks/use-profile";
import { deleteSimulation, loadSimulations } from "@/lib/storage";
import type { SavedSimulation } from "@/lib/types";

export function SavedPlanView({ id }: { id: string }) {
  const router = useRouter();
  const { setProfile } = useProfile();
  const [simulation, setSimulation] = useState<SavedSimulation | null>(null);

  useEffect(() => {
    const loaded = loadSimulations();
    const found = loaded.find((s) => s.id === id);
    if (found) {
      setSimulation(found);
    }
  }, [id]);

  const rows = useMemo(
    () => (simulation ? buildSituationRows(simulation.result.currentProfile, simulation.result.proposedProfile) : []),
    [simulation],
  );

  if (!simulation) {
    return null; // or loading state
  }

  const { result } = simulation;
  const label = LIFE_CHANGE_META[result.change.type].label;

  function makeReality() {
    if (!simulation) return;
    
    // 1. Update the actual baseline profile to match this simulation's outcome
    setProfile(simulation.result.proposedProfile);
    
    // 2. We could delete the simulation, but keeping it is harmless. 
    // Usually, users want to move on. Let's delete it since it's no longer a "What if"
    deleteSimulation(simulation.id);
    
    // 3. Take them to their real To-Dos which are now updated
    router.push("/actions");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/simulations">
            <ArrowLeft className="mr-1 size-4" />
            Back to Saved Plans
          </Link>
        </Button>
        <PageHeader title={label} />
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Your situation</h2>
          <SituationCompare rows={rows} />
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">What this means for you</h2>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </div>
          <ImpactResults impacts={result.impacts} />
        </section>

        <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center bg-surface">
          <ListChecks className="size-6 shrink-0 text-primary" aria-hidden />
          <div className="flex-1">
            <p className="font-medium">Ready to take the leap?</p>
            <p className="text-sm text-muted-foreground">Update your real profile to match this plan.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" onClick={makeReality} className="shrink-0">
              Make this my current situation
              <ArrowRight />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

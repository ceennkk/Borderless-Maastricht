"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, History, Trash2, Split } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LIFE_CHANGE_META } from "@/lib/constants";
import { deriveActions } from "@/lib/rules";
import { deleteSimulation, loadSimulations } from "@/lib/storage";
import type { SavedSimulation } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function SimulationsView() {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);

  useEffect(() => {
    setSimulations(loadSimulations());
  }, []);

  function removeSimulation(id: string) {
    setSimulations(deleteSimulation(id));
  }

  if (simulations.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title="Saved Plans" />
        <Card className="flex flex-col items-center gap-4 p-8 text-center sm:p-12">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
            <History className="size-6 text-muted-foreground" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="font-semibold">No saved plans yet</p>
            <p className="text-sm text-muted-foreground">
              Create a plan and save it to review it later.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link href="/simulator">
              Plan a Change
              <ArrowRight />
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Saved Plans"
        action={
          <Button asChild>
            <Link href="/simulator">
              <Split />
              New Plan
            </Link>
          </Button>
        }
      />

      <div className="divide-y divide-border border border-border bg-card">
        {simulations.map((simulation) => {
          const label = LIFE_CHANGE_META[simulation.result.change.type].label;
          const actionCount = deriveActions(simulation.result.impacts).length;
          return (
            <details key={simulation.id} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(simulation.createdAt)} · {actionCount} todo{actionCount === 1 ? "" : "s"}
                  </p>
                </div>
                {simulation.todoActionIds.length > 0 && (
                  <span className="border-l-2 border-ok pl-2 text-xs font-medium text-ok-foreground">
                    In todos
                  </span>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Delete"
                  title="Delete"
                  onClick={(event) => {
                    // Keep the click from toggling the <details> open.
                    event.preventDefault();
                    removeSimulation(simulation.id);
                  }}
                >
                  <Trash2 />
                </Button>
              </summary>
              <div className="space-y-4 border-t border-border px-4 py-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {simulation.result.summary}
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/simulations/${simulation.id}`}>
                    View Plan
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

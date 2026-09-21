"use client";

/**
 * "What if?" simulator.
 *
 * The component holds only the selection state. Everything it renders comes
 * from `simulateChange` in lib/rules.ts, so a real rule engine improves this
 * page without touching it.
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ListChecks, RotateCcw, Save } from "lucide-react";

import { ChangeForm } from "./change-form";
import { ChangePicker } from "./change-picker";
import { ImpactResults } from "./impact-results";
import { SituationCompare } from "./situation-compare";
import { DocumentAnalysisCard } from "@/components/documents/document-analysis-card";
import { DocumentDropzone } from "@/components/documents/document-dropzone";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { LIFE_CHANGE_META } from "@/lib/constants";
import { toLifeChange } from "@/lib/documents";
import { buildSituationRows, deriveActions, simulateChange } from "@/lib/rules";
import {
  addActions,
  loadSimulations,
  saveSimulation as persistSimulation,
} from "@/lib/storage";
import type {
  DocumentAnalysis,
  LifeChange,
  LifeChangeType,
  SavedSimulation,
  SimulationResult,
} from "@/lib/types";
import { createId } from "@/lib/utils";

export function SimulatorView() {
  const router = useRouter();
  const { profile } = useProfile();

  const [type, setType] = useState<LifeChangeType | undefined>();
  const [change, setChange] = useState<LifeChange | null>(null);
  const [submitted, setSubmitted] = useState<LifeChange | null>(null);
  const [savedResult, setSavedResult] = useState<SimulationResult | null>(null);
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  /** A document waiting to be confirmed, before it becomes a LifeChange. */
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);

  useEffect(() => {
    setSimulations(loadSimulations());
  }, []);

  const result = useMemo(
    () => savedResult ?? (submitted ? simulateChange(profile, submitted) : null),
    [profile, savedResult, submitted],
  );

  const rows = useMemo(
    () => (result ? buildSituationRows(result.currentProfile, result.proposedProfile) : []),
    [result],
  );

  function reset() {
    setType(undefined);
    setChange(null);
    setSubmitted(null);
    setSavedResult(null);
    setActiveSimulationId(null);
    setSavedNotice(false);
    setAnalysis(null);
  }

  /** A confirmed document becomes an ordinary LifeChange — same pipeline. */
  function applyAnalysis() {
    if (!analysis) return;
    const documentChange = toLifeChange(analysis);
    if (!documentChange) return;
    setAnalysis(null);
    setSubmitted(documentChange);
    setSavedResult(null);
    setActiveSimulationId(null);
  }

  function saveCurrentSimulation(): SavedSimulation | null {
    if (!result) return null;
    const existing = activeSimulationId
      ? simulations.find((simulation) => simulation.id === activeSimulationId)
      : undefined;
    const snapshot: SavedSimulation = existing ?? {
      id: createId("simulation"),
      createdAt: new Date().toISOString(),
      result,
      todoActionIds: [],
    };
    const next = persistSimulation(snapshot);
    setSimulations(next);
    setActiveSimulationId(snapshot.id);
    setSavedNotice(true);
    return snapshot;
  }

  /** Persist the simulation and copy its concrete actions into the action centre. */
  function addSimulationTodos() {
    if (!result) return;
    const snapshot = saveCurrentSimulation();
    if (!snapshot) return;
    const todos = deriveActions(result.impacts).map((action) => ({
      ...action,
      completed: false,
    }));
    addActions(todos);
    const updated = { ...snapshot, todoActionIds: todos.map((todo) => todo.id) };
    setSimulations(persistSimulation(updated));
    router.push("/actions");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Plan a Change"
        action={
          submitted ? (
            <Button variant="outline" onClick={reset}>
              <RotateCcw />
              Start over
            </Button>
          ) : undefined
        }
      />
      {!submitted && analysis && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">What we found in your document</h2>
          <DocumentAnalysisCard
            analysis={analysis}
            onApply={applyAnalysis}
            onDiscard={() => setAnalysis(null)}
          />
        </section>
      )}

      {!submitted && !analysis && (
        <>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">What are you considering?</h2>
            <ChangePicker selected={type} onSelect={setType} />
          </section>

          {!type && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground">
                  or let a document tell us
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <DocumentDropzone onAnalysed={setAnalysis} />
            </section>
          )}

          {type && (
            <Card className="space-y-6 p-6">
              <h2 className="text-lg font-semibold tracking-tight">
                {LIFE_CHANGE_META[type].label}
              </h2>
              <ChangeForm type={type} profile={profile} onChange={setChange} />
              <div className="flex justify-end border-t border-border pt-5">
                <Button
                  size="lg"
                  disabled={!change}
                  onClick={() => {
                    setSubmitted(change);
                    setSavedResult(null);
                    setActiveSimulationId(null);
                    setSavedNotice(false);
                  }}
                >
                  Simulate
                  <ArrowRight />
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {result && (
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

          <Card className="flex flex-col gap-4 bg-surface p-6 sm:flex-row sm:items-center">
            <ListChecks className="size-6 shrink-0 text-primary" aria-hidden />
            <div className="flex-1">
              <p className="font-medium">Create Step-by-Step Plan</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={saveCurrentSimulation} className="shrink-0">
                {savedNotice || activeSimulationId ? <Check /> : <Save />}
                {savedNotice || activeSimulationId ? "Saved" : "Save plan"}
              </Button>
              <Button size="lg" onClick={addSimulationTodos} className="shrink-0">
                Add to my To-Dos
                <ArrowRight />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}



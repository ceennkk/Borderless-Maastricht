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
import { ArrowRight, Check, ChevronDown, History, ListChecks, RotateCcw, Save, Trash2 } from "lucide-react";

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
  deleteSimulation,
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
import { createId, formatDate } from "@/lib/utils";

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

  useEffect(() => setSimulations(loadSimulations()), []);

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

  function openSavedSimulation(simulation: SavedSimulation) {
    setType(simulation.result.change.type);
    setChange(simulation.result.change);
    setSubmitted(simulation.result.change);
    setSavedResult(simulation.result);
    setActiveSimulationId(simulation.id);
    setSavedNotice(false);
    setAnalysis(null);
  }

  function removeSimulation(id: string) {
    setSimulations(deleteSimulation(id));
    if (activeSimulationId === id) {
      setActiveSimulationId(null);
      setSavedNotice(false);
    }
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

      {simulations.length > 0 && (
        <SimulationHistory
          simulations={simulations}
          onOpen={openSavedSimulation}
          onDelete={removeSimulation}
        />
      )}

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

function SimulationHistory({
  simulations,
  onOpen,
  onDelete,
}: {
  simulations: SavedSimulation[];
  onOpen: (simulation: SavedSimulation) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="size-5 text-muted-foreground" aria-hidden />
        <h2 className="text-lg font-semibold tracking-tight">Saved simulations</h2>
        <span className="border-l border-border pl-2 text-xs text-muted-foreground">
          {simulations.length}
        </span>
      </div>
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
                    onDelete(simulation.id);
                  }}
                >
                  <Trash2 />
                </Button>
              </summary>
              <div className="space-y-4 border-t border-border px-4 py-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {simulation.result.summary}
                </p>
                <Button size="sm" variant="outline" onClick={() => onOpen(simulation)}>
                  Open simulation
                  <ArrowRight />
                </Button>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

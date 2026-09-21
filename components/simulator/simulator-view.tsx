"use client";

/**
 * "What if?" simulator.
 *
 * The component holds only the selection state. Everything it renders comes
 * from `simulateChange` in lib/rules.ts, so a real rule engine improves this
 * page without touching it.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ListChecks, RotateCcw } from "lucide-react";

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
import { buildSituationRows, simulateChange } from "@/lib/rules";
import type { DocumentAnalysis, LifeChange, LifeChangeType } from "@/lib/types";

export function SimulatorView() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();

  const [type, setType] = useState<LifeChangeType | undefined>();
  const [change, setChange] = useState<LifeChange | null>(null);
  const [submitted, setSubmitted] = useState<LifeChange | null>(null);
  /** A document waiting to be confirmed, before it becomes a LifeChange. */
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);

  const result = useMemo(
    () => (submitted ? simulateChange(profile, submitted) : null),
    [profile, submitted],
  );

  const rows = useMemo(
    () => (result ? buildSituationRows(result.currentProfile, result.proposedProfile) : []),
    [result],
  );

  function reset() {
    setType(undefined);
    setChange(null);
    setSubmitted(null);
    setAnalysis(null);
  }

  /** A confirmed document becomes an ordinary LifeChange — same pipeline. */
  function applyAnalysis() {
    if (!analysis) return;
    const documentChange = toLifeChange(analysis);
    if (!documentChange) return;
    setAnalysis(null);
    setSubmitted(documentChange);
  }

  /** The end of the demo journey: adopt the proposed situation and get the tasks. */
  function generateActionPlan() {
    if (!result) return;
    setProfile(result.proposedProfile);
    router.push("/actions");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="What if?"
        description="Try a change before you make it. We compare your situation today with the one you are considering."
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
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                <Button size="lg" disabled={!change} onClick={() => setSubmitted(change)}>
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
              <h2 className="text-lg font-semibold tracking-tight">What this would affect</h2>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>
            <ImpactResults impacts={result.impacts} />
          </section>

          <Card className="flex flex-col gap-4 bg-surface p-6 sm:flex-row sm:items-center">
            <ListChecks className="size-6 shrink-0 text-primary" aria-hidden />
            <div className="flex-1">
              <p className="font-medium">Turn this into a plan</p>
              <p className="text-sm text-muted-foreground">
                We will update your profile and put the concrete steps in your action centre.
              </p>
            </div>
            <Button size="lg" onClick={generateActionPlan} className="shrink-0">
              Generate action plan
              <ArrowRight />
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

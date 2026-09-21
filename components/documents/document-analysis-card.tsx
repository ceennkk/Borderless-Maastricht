"use client";

/**
 * What we read, shown back for confirmation.
 *
 * Extraction is never applied silently. The user sees the document's own
 * summary, every value we took from it, how confident the reader was and what
 * it could not find — and only then decides.
 */
import { AlertTriangle, CalendarClock, CheckCircle2, FileText, X } from "lucide-react";

import { CountryChip } from "@/components/shared/country-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DOCUMENT_TYPE_META, describeExtraction } from "@/lib/documents";
import { LIFE_CHANGE_META } from "@/lib/constants";
import type { AnalysisConfidence, DocumentAnalysis } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const CONFIDENCE_META: Record<AnalysisConfidence, { label: string; chip: string; icon: typeof CheckCircle2 }> = {
  high: { label: "Clearly readable", chip: "bg-ok-surface text-ok-foreground border-ok/25", icon: CheckCircle2 },
  medium: { label: "Partly inferred", chip: "bg-check-surface text-check-foreground border-check/30", icon: AlertTriangle },
  low: { label: "Hard to read", chip: "bg-action-surface text-action-foreground border-action/30", icon: AlertTriangle },
};

export function DocumentAnalysisCard({
  analysis,
  onApply,
  onDiscard,
}: {
  analysis: DocumentAnalysis;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const type = DOCUMENT_TYPE_META[analysis.documentType];
  const confidence = CONFIDENCE_META[analysis.confidence];
  const ConfidenceIcon = confidence.icon;
  const rows = describeExtraction(analysis.extracted);
  const canApply = rows.length > 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="space-y-1">
            <p className="font-medium leading-snug">{type.label}</p>
            <p className="text-xs text-muted-foreground">
              {analysis.fileName ?? "Uploaded document"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {analysis.issuingCountry && <CountryChip country={analysis.issuingCountry} />}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              confidence.chip,
            )}
          >
            <ConfidenceIcon className="size-3.5" aria-hidden />
            {confidence.label}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <Section title="What this is">
          <p className="text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
        </Section>

        {rows.length > 0 && (
          <Section title="What we read from it">
            <dl className="divide-y divide-border rounded-lg border border-border">
              {rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 px-3 py-2">
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="text-right text-sm font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {analysis.deadlines.length > 0 && (
          <Section title="Dates it mentions">
            <ul className="space-y-1.5">
              {analysis.deadlines.map((d) => (
                <li key={`${d.label}-${d.date}`} className="flex items-center gap-2 text-sm">
                  <CalendarClock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="text-muted-foreground">{d.label}:</span>
                  <span className="font-medium">{formatDate(d.date) ?? d.date}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {analysis.missingInfo.length > 0 && (
          <Section title="What it does not say">
            <ul className="space-y-1">
              {analysis.missingInfo.map((m) => (
                <li key={m} className="text-sm text-muted-foreground">
                  · {m}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <p className="rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
          Check these values before continuing. We read documents automatically and can misread
          them — nothing is applied to your profile until you confirm.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-surface/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {canApply
            ? analysis.detectedChange
              ? `This looks like: ${LIFE_CHANGE_META[analysis.detectedChange].label.toLowerCase()}.`
              : "We can work out what this changes for you."
            : "We could not read anything that changes your situation."}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDiscard}>
            <X />
            Discard
          </Button>
          <Button onClick={onApply} disabled={!canApply}>
            See what this changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

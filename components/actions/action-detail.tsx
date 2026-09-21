/**
 * The expanded body of a task: why it matters, what to do, what to bring.
 *
 * Shared by the plain task list and by a step in the schedule, so both show
 * exactly the same thing when opened.
 */
import { Building2, FileText } from "lucide-react";

import { SourceLink } from "@/components/shared/source-link";
import type { Action } from "@/lib/types";

export function ActionDetail({ action }: { action: Action }) {
  const hasAnything =
    action.why || action.steps?.length || action.documents?.length || action.authority || action.source;

  if (!hasAnything) {
    return (
      <p className="text-sm text-muted-foreground">
        No further detail for this step yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {action.why && (
        <Section title="Why this matters">
          <p className="text-sm leading-relaxed text-muted-foreground">{action.why}</p>
        </Section>
      )}

      {action.steps && action.steps.length > 0 && (
        <Section title="What to do">
          <ol className="space-y-2">
            {action.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {action.documents && action.documents.length > 0 && (
        <Section title="Documents">
          <ul className="flex flex-wrap gap-2">
            {action.documents.map((doc) => (
              <li
                key={doc}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs"
              >
                <FileText className="size-3.5 text-muted-foreground" aria-hidden />
                {doc}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {action.authority && (
        <Section title="Authority">
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="size-3.5" aria-hidden />
            {action.authority}
          </p>
        </Section>
      )}

      {action.source && (
        <Section title="Official source">
          <SourceLink source={action.source} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

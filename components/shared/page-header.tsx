import type { ReactNode } from "react";

/** Consistent title block for every page below the app shell. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        <h1 className="font-display text-4xl font-medium leading-none tracking-[-0.025em] sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl pt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

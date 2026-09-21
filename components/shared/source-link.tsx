import { ExternalLink } from "lucide-react";

import type { Source } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Sources are what makes the app trustworthy — render them the same way
 * everywhere, always with the issuing authority visible.
 */
export function SourceLink({ source, className }: { source: Source; className?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-start gap-1.5 text-sm text-muted-foreground hover:text-primary hover:underline",
        className,
      )}
    >
      <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>
        {source.label}
        {source.authority && (
          <span className="block text-xs text-muted-foreground/80">{source.authority}</span>
        )}
      </span>
    </a>
  );
}

import Link from "next/link";

import { cn } from "@/lib/utils";

/** Wordmark. The mark is a simple crossing of two borders. */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 20 20 4" strokeLinecap="round" />
          <path d="M4 12h6M14 12h6" strokeLinecap="round" opacity="0.6" />
        </svg>
      </span>
      <span className="text-base font-semibold tracking-tight">Borderless</span>
    </Link>
  );
}

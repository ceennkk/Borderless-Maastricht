import Link from "next/link";
import { ArrowRight, CheckCircle2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Impact } from "@/lib/types";

/** The "3 things need your attention" banner. */
export function AttentionSummary({ impacts }: { impacts: Impact[] }) {
  const needing = impacts.filter((i) => i.status !== "OK");
  const count = needing.length;

  if (count === 0) {
    return (
      <Card className="flex items-center gap-4 rounded-none border-x-0 border-ok/25 bg-ok-surface p-5">
        <CheckCircle2 className="size-6 shrink-0 text-ok" aria-hidden />
        <div className="flex-1">
          <p className="font-semibold text-ok-foreground">Nothing needs your attention</p>
          <p className="text-sm text-ok-foreground/80">
            Everything we can see about your situation is in order.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 rounded-none border-x-0 border-action/25 bg-action-surface p-5 sm:flex-row sm:items-center">
      <TriangleAlert className="size-6 shrink-0 text-action" aria-hidden />
      <div className="flex-1">
        <p className="font-semibold text-action-foreground">
          {count} thing{count === 1 ? "" : "s"} need{count === 1 ? "s" : ""} your attention
        </p>
        <p className="text-sm text-action-foreground/80">
          {needing
            .slice(0, 3)
            .map((i) => i.title)
            .join(" · ")}
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/actions">
          Open action centre
          <ArrowRight />
        </Link>
      </Button>
    </Card>
  );
}

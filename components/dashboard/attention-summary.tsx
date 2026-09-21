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
      <Card className="flex items-center gap-4 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-ok-surface">
          <CheckCircle2 className="size-5 text-ok" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="font-semibold">Nothing needs your attention</p>
          <p className="text-sm text-muted-foreground">
            Everything we can see about your situation is in order.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-check-surface">
        <TriangleAlert className="size-5 text-check-foreground" aria-hidden />
      </span>
      <div className="flex-1">
        <p className="font-semibold">
          {count} thing{count === 1 ? "" : "s"} need{count === 1 ? "s" : ""} your attention
        </p>
        <p className="text-sm text-muted-foreground">
          Start with the next practical step. The rest is waiting in your action centre.
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

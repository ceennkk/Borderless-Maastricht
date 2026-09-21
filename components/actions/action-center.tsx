"use client";

/** Personal action centre — the tasks generated from the user's impacts. */
import Link from "next/link";
import { ListChecks } from "lucide-react";

import { ActionList } from "./action-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActions } from "@/hooks/use-actions";
import { useProfile } from "@/hooks/use-profile";

export function ActionCenter() {
  const { impacts } = useProfile();
  const { actions, open, done, toggle } = useActions(impacts);

  const progress = actions.length === 0 ? 0 : (done.length / actions.length) * 100;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your actions"
        description="The concrete steps that follow from your situation. Open one to see why it matters and who to contact."
      />

      {actions.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-8" />}
          title="No actions right now"
          description="Nothing in your current situation needs doing. Try the simulator to see what a change would add."
          action={
            <Button asChild variant="outline">
              <Link href="/simulator">Open the simulator</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {done.length} of {actions.length} done
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {open.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">To do</h2>
              <ActionList actions={open} onToggle={toggle} />
            </section>
          )}

          {done.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">
                Completed
              </h2>
              <ActionList actions={done} onToggle={toggle} />
            </section>
          )}
        </>
      )}
    </div>
  );
}

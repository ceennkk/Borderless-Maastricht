"use client";

/**
 * Multi-step onboarding.
 *
 * The wizard owns navigation and the draft; the questions live in steps.tsx.
 * On completion it writes a UserProfile through the storage layer and hands the
 * user to the dashboard.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { EMPTY_DRAFT, draftToProfile, type ProfileDraft } from "./draft";
import { ONBOARDING_STEPS } from "./steps";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/hooks/use-profile";

export function OnboardingWizard() {
  const router = useRouter();
  const { setProfile } = useProfile();
  const [draft, setDraft] = useState<ProfileDraft>(EMPTY_DRAFT);
  const [index, setIndex] = useState(0);

  // Irrelevant steps (work hours when unemployed) disappear from the flow entirely.
  const steps = useMemo(
    () => ONBOARDING_STEPS.filter((s) => s.isRelevant?.(draft) ?? true),
    [draft],
  );

  const safeIndex = Math.min(index, steps.length - 1);
  const step = steps[safeIndex];
  const isLast = safeIndex === steps.length - 1;
  const canContinue = step.isComplete(draft);

  function update(patch: Partial<ProfileDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function next() {
    if (!canContinue) return;
    if (isLast) {
      setProfile(draftToProfile(draft));
      router.push("/dashboard");
      return;
    }
    setIndex(safeIndex + 1);
  }

  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Logo size="md" />
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Skip</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-16">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              Step {safeIndex + 1} of {steps.length}
            </span>
            <span>{Math.round(((safeIndex + 1) / steps.length) * 100)}%</span>
          </div>
          <Progress value={((safeIndex + 1) / steps.length) * 100} />
        </div>

        <Card className="mt-6 p-6 sm:p-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{step.question}</h1>
            {step.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            )}
          </div>

          <div className="mt-8">
            <step.Body draft={draft} update={update} />
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setIndex(Math.max(0, safeIndex - 1))}
            disabled={safeIndex === 0}
          >
            <ArrowLeft />
            Back
          </Button>

          <Button onClick={next} disabled={!canContinue} size="lg">
            {isLast ? (
              <>
                <Check />
                Create my profile
              </>
            ) : (
              <>
                Continue
                <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}

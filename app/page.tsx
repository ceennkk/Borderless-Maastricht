/**
 * Landing page. Server component — no state, no hooks.
 */
import Link from "next/link";
import { ArrowRight, ListChecks, Split, UserRound } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { COUNTRY_META } from "@/lib/constants";
import { COUNTRIES } from "@/lib/constants";

const STEPS = [
  {
    icon: UserRound,
    title: "Tell us your situation",
    body: "Where you live, study and work. Six questions, no account.",
  },
  {
    icon: Split,
    title: "See what a change would mean",
    body: "A job in Aachen, a move to Hasselt, three days from home — before you commit.",
  },
  {
    icon: ListChecks,
    title: "Get a plan you can act on",
    body: "Concrete steps, the authority to contact, and the official source behind each one.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh font-copy">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-10">
        <Logo size="lg" />
        <Link
          href="/dashboard"
          className="hidden text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          View the demo
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden />
            For students and young professionals in the Maastricht Euregio
          </p>

          <h1 className="mt-6 max-w-3xl font-brand text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem]">
            Your life crosses borders.
            <span className="block text-primary">Your next step stays clear.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Live in the Netherlands, study in Maastricht, work in Aachen. Borderless turns
            three administrative systems into one clear, sourced plan.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/onboarding">
                Build your profile
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">See an example</Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-2 sm:gap-3" aria-label="Netherlands, Germany and Belgium">
            {COUNTRIES.map((country, index) => (
              <div key={country} className="contents">
                {index > 0 && <span className="border-line block h-2 w-6 shrink-0 sm:w-16" aria-hidden />}
                <span className="rounded-full border border-border bg-card px-3 py-1 text-sm font-medium">
                  {COUNTRY_META[country].name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <h2 className="mt-2 max-w-xl font-brand text-3xl font-semibold leading-tight tracking-[-0.02em]">
              From a complicated situation to a useful answer.
            </h2>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="rounded-xl border border-border bg-background p-6">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-brand text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Reassurance */}
        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="text-sm font-semibold text-primary">Designed for trust</p>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            <Fact title="Built for the Euregio" body="Netherlands, Germany and Belgium — the three systems students and young professionals here actually deal with." />
            <Fact title="Sources, not opinions" body="Every impact points at the authority behind it, so you can check the answer yourself." />
            <Fact title="No account needed" body="Your profile is stored on your device, not in our database. It is only sent anywhere if you ask the assistant a question." />
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:justify-between lg:px-10">
          <span>Borderless Maastricht</span>
          <span>Prototype information · Not legal advice</span>
        </div>
      </footer>
    </div>
  );
}

function Fact({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <span aria-hidden className="border-line block h-2 w-10" />
      <h3 className="mt-4 font-brand text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

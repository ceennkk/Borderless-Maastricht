/**
 * Landing page. Server component — no state, no hooks.
 */
import Link from "next/link";
import { ArrowRight, Compass, ListChecks, Split } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COUNTRY_META } from "@/lib/constants";
import { COUNTRIES } from "@/lib/constants";

const STEPS = [
  {
    icon: Compass,
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
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">See the demo</Link>
        </Button>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-grid border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {COUNTRIES.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1"
                  >
                    <span aria-hidden>{COUNTRY_META[c].flag}</span>
                    {c}
                  </span>
                ))}
                <span className="ml-1">Maastricht Euregio</span>
              </div>

              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Your life crosses borders.
                <br />
                <span className="text-muted-foreground">Your paperwork shouldn&apos;t.</span>
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Live in the Netherlands, study in Maastricht, work in Aachen. Borderless shows you
                which parts of your administrative life change — and what to do about each one.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg">
                  <Link href="/onboarding">
                    Start
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">See a demo profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="space-y-3 p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Step {i + 1}
                    </span>
                  </div>
                  <h2 className="font-semibold">{step.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Reassurance */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-8 md:grid-cols-3">
              <Fact title="Built for the Euregio" body="Netherlands, Germany and Belgium — the three systems students and young professionals here actually deal with." />
              <Fact title="Sources, not opinions" body="Every impact points at the authority behind it, so you can check the answer yourself." />
              <Fact title="No account needed" body="Your profile is stored on your device, not in our database. It is only sent anywhere if you ask the assistant a question." />
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
        Borderless — hackathon prototype. Information is illustrative and not legal advice.
      </footer>
    </div>
  );
}

function Fact({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

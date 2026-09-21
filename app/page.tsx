/**
 * Landing page. Server component — no state, no hooks.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { COUNTRY_META } from "@/lib/constants";
import { COUNTRIES } from "@/lib/constants";

const STEPS = [
  {
    title: "Tell us your situation",
    body: "Where you live, study and work. Six questions, no account.",
  },
  {
    title: "See what a change would mean",
    body: "A job in Aachen, a move to Hasselt, three days from home — before you commit.",
  },
  {
    title: "Get a plan you can act on",
    body: "Concrete steps, the authority to contact, and the official source behind each one.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-border px-6 py-6 lg:px-10">
        <Logo size="lg" />
        <Link
          href="/dashboard"
          className="text-sm font-semibold underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        >
          View the working demo
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
            <div className="flex items-center gap-4 border-b border-border pb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <span>Maastricht Euregio</span>
              <span className="h-px flex-1 bg-border" />
              <span>Practical cross-border guidance</span>
            </div>

            <h1 className="py-10 font-display text-5xl font-medium leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:py-12 lg:text-[6rem]">
              Your life crosses borders.
              <span className="block text-muted-foreground">Your next step stays clear.</span>
            </h1>

            <div className="grid gap-10 border-t border-border pt-8 md:grid-cols-12 md:items-end">
              <p className="text-lg leading-relaxed text-muted-foreground md:col-span-5">
                Live in the Netherlands, study in Maastricht, work in Aachen. Borderless turns
                three administrative systems into one clear, sourced plan.
              </p>

              <div className="md:col-span-3 md:col-start-7">
                <Button asChild size="lg" className="w-full justify-between">
                  <Link href="/onboarding">
                    Build your profile
                    <ArrowRight />
                  </Link>
                </Button>
              </div>

              <div className="md:col-span-3 md:col-start-10">
                <div className="flex items-center justify-between" aria-label="Netherlands, Germany and Belgium">
                  {COUNTRIES.map((country, index) => (
                    <div key={country} className="contents">
                      {index > 0 && <span className="h-px flex-1 bg-border" aria-hidden />}
                      <span className="grid size-11 place-items-center border border-border bg-card text-sm font-bold">
                        <span className="sr-only">{COUNTRY_META[country].name}</span>
                        {country}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="mb-12 grid gap-4 md:grid-cols-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:col-span-3">
              How it works
            </p>
            <h2 className="font-display text-4xl leading-tight tracking-tight md:col-span-7 md:text-5xl">
              From a complicated situation to a useful answer.
            </h2>
          </div>

          <div className="border-y border-border md:grid md:grid-cols-3">
            {STEPS.map((step, i) => {
              return (
                <article
                  key={step.title}
                  className="border-b border-border py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                >
                  <p className="font-display text-5xl text-border">0{i + 1}</p>
                  <h3 className="mt-8 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Reassurance */}
        <section className="bg-sidebar text-sidebar-foreground">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="mb-10 text-xs font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/55">
              Designed for trust
            </p>
            <div className="grid gap-10 md:grid-cols-3">
              <Fact title="Built for the Euregio" body="Netherlands, Germany and Belgium — the three systems students and young professionals here actually deal with." />
              <Fact title="Sources, not opinions" body="Every impact points at the authority behind it, so you can check the answer yourself." />
              <Fact title="No account needed" body="Your profile is stored on your device, not in our database. It is only sent anywhere if you ask the assistant a question." />
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-10 text-xs text-muted-foreground sm:flex-row sm:justify-between lg:px-10">
        <span>Borderless Maastricht</span>
        <span>Prototype information · Not legal advice</span>
      </footer>
    </div>
  );
}

function Fact({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-sidebar-foreground/25 pt-5">
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/65">{body}</p>
    </div>
  );
}

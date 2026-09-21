# Borderless

Cross-border life management for students and young professionals in the
Maastricht Euregio — **🇳🇱 Netherlands · 🇩🇪 Germany · 🇧🇪 Belgium**.

Live in Maastricht, study in Maastricht, work in Aachen? Borderless shows which
parts of your administrative life are affected, what a change would mean before
you make it, and exactly what to do about each one.

## Quick start

Requires Node 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Routes

| Route | |
| --- | --- |
| `/` | Landing |
| `/onboarding` | Build your cross-border profile |
| `/dashboard` | Overview of your situation |
| `/simulator` | "What if?" — try a change before you make it |
| `/actions` | Your personal action centre |
| `/opportunities` | Benefits and tips you may qualify for |
| `/profile` | What is stored, and a reset |

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn-style UI primitives.

Hackathon MVP: mock data and `localStorage`, no database, no auth.

**Ask Borderless** and **document upload** are wired to OpenAI through
`app/api/ask/route.ts` and `app/api/documents/route.ts`. Copy `.env.example` to
`.env.local` and set `OPENAI_API_KEY` to enable them — without a key both fall
back to a mock and the app keeps working.

Upload lives in the simulator: photograph an employment contract and Borderless
reads where you will work, how many hours and from when, then runs that through
the same rule engine as a manually chosen change. Documents are processed in
memory and never stored.

The rule engine (`lib/rules.ts`) is still behind a stable interface so it can be
implemented without touching the UI.

## Contributing

**Read [PROJECT.md](PROJECT.md) first** — it covers the architecture, the shared
data model, who owns which folder, and the rules for changing shared code.

```bash
npm run typecheck
npm run build
```

Both must pass before you push.

---

Not legal advice. All content is illustrative.

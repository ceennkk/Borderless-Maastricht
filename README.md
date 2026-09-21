# Borderless

Cross-border life management for students and young professionals in the
Maastricht Euregio — **🇳🇱 Netherlands · 🇩🇪 Germany · 🇧🇪 Belgium**.

Live in Maastricht, study in Maastricht, work in Aachen? Borderless shows which
parts of your administrative life are affected, what a change would mean before
you make it, and exactly what to do about each one.

## Getting started

**Requires Node 20 or newer** (`node --version`). If you use nvm: `nvm use`
picks the version from `.nvmrc`.

```bash
git clone git@github.com:ceennkk/Borderless-Maastricht.git
cd Borderless-Maastricht
npm ci
npm run dev
```

Open http://localhost:3000. That is all — **the app runs without any API key**
and without configuration. Everything except the AI features works on mock data.

### Optional: enable the AI features

Ask Borderless, document upload and the scheduling agent call OpenAI. Without a
key they degrade gracefully: Ask and upload return a mock answer with a notice,
and the planner says it is not configured. Nothing crashes, and the whole demo
flow stays clickable.

To switch them on:

```bash
cp .env.example .env.local
```

Then put your key in `.env.local` behind `OPENAI_API_KEY=` and restart the dev
server.

**Each developer uses their own key.** Do not paste a shared key into chat, a
ticket or a commit — `.env.local` is gitignored for exactly this reason. If a
key does get committed, revoke it in the OpenAI dashboard rather than deleting
the commit; the old one stays in the history.

### Verify your setup

```bash
npm run typecheck && npm run build
```

Both must pass before you push.

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

The **scheduling agent** in the action centre turns your open tasks into a dated
plan — the right order, realistic target dates, an `.ics` for your calendar and
a drafted message in each authority's own language, with your own details
already filled in. It also prepares appointments: which service to pick in a
portal's list, what to bring, and every form field ready to paste.

It drafts and prepares; **you** send and book. Borderless never contacts anyone
on your behalf. Your name, date of birth, BSN and Steuer-ID are stored on your
device and filled into letters locally — they are never sent to the AI.

The rule engine (`lib/rules.ts`) is still behind a stable interface so it can be
implemented without touching the UI.

## Contributing

**Read [PROJECT.md](PROJECT.md) first** — it covers the architecture, the shared
data model, who owns which folder, and the rules for changing shared code.

---

Not legal advice. All content is illustrative.

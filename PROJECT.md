# Borderless — project guide

> Read this before writing code. It describes what the app is, how it is put
> together, and the rules that keep three people working in the same repository
> without stepping on each other.

---

## 1. What Borderless is

Borderless is a cross-border life management app for students and young
professionals in the Maastricht Euregio — the region where the **Netherlands**,
**Germany** and **Belgium** meet.

People here routinely live in one country, study in another and work in a third.
When something changes — a job in Aachen, a move to Hasselt, three days a week
from home, graduation — they usually have no idea which parts of their
administrative life are affected.

The product walks a single line:

```
UNDERSTAND THE USER
  → DETECT A LIFE CHANGE
    → IDENTIFY AFFECTED AREAS
      → EXPLAIN THE IMPACT
        → GENERATE ACTIONS
          → SHOW RELEVANT OPPORTUNITIES
```

**Borderless is not a chatbot.** "Ask Borderless" exists, but it sits beside the
product rather than being the product. The value is in the structured view of a
person's situation.

### The demo journey

The hackathon demo must stay navigable end to end at all times:

`/` → `/onboarding` → `/dashboard` → `/simulator` → start a job in Aachen →
see affected areas → **Generate action plan** → `/actions`

### Status

Hackathon MVP on mock data. No auth, no database. Everything the app remembers
lives in `localStorage`.

**Ask Borderless** and **document upload** are live against OpenAI, and both fall
back to a mock when no key is configured. The impacts, actions and opportunities
on every other screen are still rule-engine output over mock content.

---

## 2. Architecture

The one rule that shapes everything: **business logic never lives in a React
component.**

```
                 ┌──────────────────────────────────────────┐
   app/          │  routes — thin, compose components        │
                 └──────────────────┬───────────────────────┘
                                    │
                 ┌──────────────────▼───────────────────────┐
   components/   │  presentation — props in, JSX out         │
                 └──────────────────┬───────────────────────┘
                                    │
                 ┌──────────────────▼───────────────────────┐
   hooks/        │  binds lib/ to React state                │
                 └──────────────────┬───────────────────────┘
                                    │
                 ┌──────────────────▼───────────────────────┐
   lib/          │  types · rules · storage · ai · data      │
                 └──────────────────────────────────────────┘
```

### Folder map

```
app/
  layout.tsx            root layout; mounts the AppShell
  globals.css           design tokens (Tailwind v4 @theme)
  page.tsx              landing
  onboarding/           profile creation
  dashboard/            overview of the user's cross-border life
  simulator/            "what if?"
  actions/              personal action centre
  opportunities/        benefits and tips
  profile/              stored profile, reset

components/
  ui/                   shadcn-style primitives (button, card, badge, …)
  layout/               app shell, navigation, Ask Borderless panel
  shared/               cross-feature pieces (CountryBadge, StatusBadge, …)
  dashboard/            dashboard-only components
  onboarding/           wizard, steps, form fields
  simulator/            change picker, comparison, impact results
  actions/              action list and detail
  opportunities/        opportunity cards

hooks/
  use-profile.ts        the user + their impacts (falls back to the demo persona)
  use-actions.ts        actions with persisted completion state

lib/
  types.ts              THE shared data model
  constants.ts          labels, icons, ordering for the shared enums
  mock-data.ts          demo content (sources, persona, impacts, opportunities)
  rules.ts              the rule engine — analyzeProfile / simulateChange
  opportunities.ts      opportunity matching
  storage.ts            localStorage persistence
  ai.ts                 AI provider interface + mock implementation
  utils.ts              cn(), ids, date formatting
```

### The two seams that matter

**1. The rule engine** (`lib/rules.ts`)

Every page that shows an impact calls one of two functions:

```ts
analyzeProfile(profile: UserProfile): Impact[]

simulateChange(profile: UserProfile, change: LifeChange): {
  change, currentProfile, proposedProfile, impacts, summary
}
```

Today these are shallow heuristics producing demo-quality output. Replacing them
with a real engine means rewriting the private `rule*` functions inside that
file. **The exported signatures must not change** — every UI screen is already
built against them.

A `LifeChange` carries a `patch: Partial<UserProfile>`, so the engine derives the
proposed situation with `applyChange` instead of special-casing each change type.

**2. The AI layer** (`lib/ai.ts`)

```ts
interface BorderlessAI {
  ask(question: string, context?: AskContext): Promise<AiAnswer>
  explainImpact(impact: Impact, profile?: UserProfile | null): Promise<string>
}

getAI(): BorderlessAI     // what components call
setAI(next): void         // how you swap the implementation
```

No component imports a vendor SDK, sees an API key, or knows which model
answered. Two implementations ship:

| | |
| --- | --- |
| `httpAI` (default) | POSTs to `/api/ask`. |
| `mockAI` | Canned answers. |

`httpAI` **degrades to `mockAI` on any failure** — no key, timeout, rate limit,
network error. The panel then shows the mock answer plus a one-line notice. This
is deliberate: the demo must not break in front of an audience.

The chain:

```
AskBorderlessPanel  →  getAI().ask()  →  POST /api/ask  →  OpenAI
   (client)             lib/ai.ts        route handler      (key lives here only)
                                              ↑
                                     lib/ai-prompt.ts
                            system prompt + the user's profile,
                            flagged impacts and permitted sources
```

Implemented with `fetch`, not a vendor SDK, so the project gained no dependency.

`lib/ai-prompt.ts` is where answer quality lives. It serialises the profile and
the impacts the rule engine produced, and instructs the model to answer only
from that context — never to invent a threshold, deadline or amount, and to send
the user to a free GrenzInfoPunkt consultation when the answer really depends on
specifics we do not hold. Tune answers there, not in the component.

**Privacy:** a question sends the local profile and current impacts to the model
provider. Nothing is stored server-side. Say so if you change what is sent.

**3. The document layer** (`lib/documents.ts`)

A document is treated as a *report of a life change*, not as a separate feature.
The analyser reads it into `DocumentAnalysis.extracted`, which is a
`Partial<UserProfile>` — the same shape as `LifeChange.patch`:

```
Upload → DocumentAnalysis → toLifeChange() → simulateChange() → impacts → actions
                                                  ↑ the existing pipeline, unchanged
```

So upload reuses `SituationCompare` and `ImpactResults` rather than duplicating
them, and a better rule engine improves document analysis for free.

```ts
getDocumentAnalyzer(): DocumentAnalyzer   // what components call
setDocumentAnalyzer(next): void
toLifeChange(analysis): LifeChange | null // the bridge to rules.ts
describeExtraction(patch): Array<{label, value}>   // for the confirmation step
```

Three rules this layer enforces, which reviewers should not relax:

1. **Nothing is applied silently.** Extraction always passes through
   `DocumentAnalysisCard` so the user checks the values first. The model reads
   documents wrongly sometimes; `confidence` and `missingInfo` are shown, never
   hidden.
2. **The file is never stored.** It is processed in memory by the route handler
   and discarded. Only the analysis is kept, in `localStorage`.
3. **Images are re-encoded client-side** (`prepareImage`) before upload. This
   strips EXIF — phone photos carry GPS coordinates — caps what leaves the
   device, and cuts the vision token cost.

Extraction quality lives in `lib/document-prompt.ts`, which holds the strict
JSON schema and the instructions. Tune it there, not in the component.

---

## 3. Shared types

All of these live in **`lib/types.ts`**. Import them from there — never redeclare
them locally.

| Type | Purpose |
| --- | --- |
| `Country` | `"NL" \| "DE" \| "BE"` |
| `UserProfile` | Who the user is: residence, study, work, hours, remote days, citizenship, insurance |
| `LifeChangeType` | `NEW_JOB`, `MOVE`, `REMOTE_WORK`, `CHANGE_WORK_HOURS`, `GRADUATION`, `START_STUDY`, `CHANGE_EMPLOYER` |
| `LifeChange` | A change type plus the profile `patch` it produces |
| `ImpactCategory` | `HEALTH_INSURANCE`, `SOCIAL_SECURITY`, `TAX`, `REGISTRATION`, `RESIDENCE`, `EMPLOYMENT`, `STUDENT_STATUS` |
| `ImpactStatus` | `OK` (nothing to do) · `CHECK` (verify) · `ACTION` (something must be done) |
| `Impact` | category, status, title, explanation, `actions`, `sources` |
| `Action` | id, title, description, category, completed, deadline?, authority?, source?, plus detail fields (`why`, `steps`, `documents`) |
| `Opportunity` | id, title, description, category, eligibility, source |
| `Source` | label, url, authority — what makes an answer checkable |
| `SimulationResult` | What `simulateChange` returns |
| `SituationRow` | One row of the CURRENT → PROPOSED table |

Display metadata for these enums (labels, descriptions, ordering) lives in
`lib/constants.ts`, not in components.

---

## 4. Folder ownership

Every folder has one owner. Touch someone else's folder only for a genuinely
shared change, and say so in the PR.

### Developer 1 — UI, onboarding, dashboard

| Owns | |
| --- | --- |
| `app/page.tsx` | landing |
| `app/onboarding/`, `components/onboarding/` | the wizard |
| `app/dashboard/`, `components/dashboard/` | the overview |
| `app/profile/` | profile view |
| `components/ui/`, `components/layout/`, `components/shared/` | design system and shell |
| `app/globals.css` | design tokens |

### Developer 2 — simulator, rule engine, actions

| Owns | |
| --- | --- |
| `lib/rules.ts` | **the rule engine** |
| `app/simulator/`, `components/simulator/` | what-if flow |
| `app/actions/`, `components/actions/` | action centre |
| `hooks/use-actions.ts` | action state |

### Developer 3 — AI, knowledge/sources, opportunities

| Owns | |
| --- | --- |
| `lib/ai.ts` | AI provider interface and implementations |
| `lib/ai-prompt.ts` | **system prompt and context serialisation — answer quality lives here** |
| `app/api/ask/route.ts` | the server route; the only holder of the API key |
| `lib/documents.ts`, `lib/document-prompt.ts` | document analysis seam and extraction schema |
| `app/api/documents/route.ts`, `components/documents/` | upload route and UI |
| `components/layout/ask-borderless-panel.tsx` | Ask Borderless |
| `lib/opportunities.ts` | opportunity matching |
| `app/opportunities/`, `components/opportunities/` | the page |
| `lib/mock-data.ts` (the `SOURCES` map and opportunities) | the knowledge base |

### Shared — change by agreement

`lib/types.ts` · `lib/constants.ts` · `lib/storage.ts` · `hooks/use-profile.ts`

---

## 5. How to run the project

Requires Node 20 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint
```

Nothing needs configuring to run the app — it works entirely on mock data. To
wipe your local state, use **Reset all local data** on `/profile`, or clear
`localStorage` for the origin.

### Environment variables

`.env.example` is committed and holds placeholders only. Real values go in
`.env.local`, which is gitignored:

```bash
cp .env.example .env.local
```

| Variable | |
| --- | --- |
| `OPENAI_API_KEY` | Read by `app/api/ask/route.ts` and `app/api/documents/route.ts`, server-side only. Without it both fall back to their mock. |
| `OPENAI_MODEL` | Optional override. Default `gpt-4.1-mini`. |

Never prefix a secret with `NEXT_PUBLIC_`. Variables with that prefix are inlined
into the browser bundle and would be publicly readable. Never commit `.env.local`.

---

## 6. Rules for developers (and AI agents) modifying this repository

**Architecture**

1. Business logic goes in `lib/`. A component that decides what an impact means
   is in the wrong place.
2. `analyzeProfile` and `simulateChange` are the only ways a screen learns what
   a situation means. Do not re-derive impacts in a component.
3. Never import a vendor SDK into a component. Go through `lib/ai.ts`.
4. Persistence goes through `lib/storage.ts`. No direct `localStorage` calls
   elsewhere — reads must stay SSR-safe.

**Shared interfaces**

5. `lib/types.ts` is a contract. Adding an optional field is cheap; renaming or
   removing one is not. Announce those before you push.
6. Add new labels, icons and ordering to `lib/constants.ts` rather than
   hard-coding strings in JSX.

**Components**

7. Keep pages thin — a route file should compose components and little else.
   If a page passes 100 lines, extract.
8. New shared pieces go in `components/shared/`; feature-specific ones stay in
   the feature folder.
9. Use `StatusBadge`, `CountryBadge`, `CategoryIcon` and `SourceLink` rather than
   re-styling those concepts. They are the visual language of the app.

**Dependencies**

10. Do not add a dependency without agreement. The current set is deliberately
    small: Next, React, Tailwind, `lucide-react`, `clsx`, `tailwind-merge`,
    `class-variance-authority`, `@radix-ui/react-slot`.
11. Do not add auth, a database, Supabase or document scanning in this phase.
    The only external call is `/api/ask`.
12. Secrets live in `.env.local` and are read **server-side only**. If you ever
    need a value in the browser, it is not a secret. Never log an API key.
13. Uploaded documents are never persisted, never logged, and never applied to a
    profile without the user confirming what was read. If you change what leaves
    the device, change the consent text in `DocumentDropzone` in the same commit.

**Content**

12. Nothing in this app is legal advice. Every impact and action should carry a
    `Source` pointing at the authority behind it. Keep the demo copy plausible
    and clearly illustrative.

**Before you push**

13. `npm run typecheck && npm run build` must both pass.
14. The demo journey (landing → onboarding → dashboard → simulator → action
    plan) must still work end to end.

**Design**

15. Trustworthy, modern, European, calm. Cards, clear hierarchy, generous
    spacing. No heavy gradients, no animation for its own sake, nothing playful.
16. Country indicators (NL/DE/BE) must stay instantly recognisable.
17. Colours come from the tokens in `app/globals.css`. Do not reach for raw
    Tailwind palette colours.

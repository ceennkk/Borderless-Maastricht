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

**Ask Borderless**, **document upload** and the **scheduling agent** are live
against OpenAI. Ask and upload fall back to a mock when no key is configured. The impacts, actions and opportunities
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

**4. The scheduling agent** (`lib/scheduling.ts`, `app/api/schedule/route.ts`)

Takes the open actions and produces a dated, ordered plan: what unblocks what,
realistic target dates, the right channel per authority, and a drafted message
where one is useful.

```
POST /api/schedule  → job id (202, returns immediately)
GET  /api/schedule?id=…  → { status, step, log, plan }
```

It is a **bounded tool loop**, not a single prompt. The agent calls
`list_authorities` / `get_authority` against `lib/authorities.ts` and is told
that anything not in a tool result does not exist. This is deliberate: a model
asked for a waiting time will invent one, and a wrong lead time or channel sends
someone to the wrong counter. Authority facts are data we control, not
generated text. `MAX_TOOL_ROUNDS` stops a confused model spinning.

### The action centre has two states, never both

```
no plan  →  plain task list + an invitation to plan
a plan   →  the plan IS the list, ordered and dated, next step first
```

Showing a schedule *above* an unordered copy of the same tasks was the single
thing that made this page confusing, so `ScheduleTimeline` replaces
`ActionList` rather than sitting beside it. `ScheduleStep` therefore carries
everything — order, date, checkbox, expandable detail, draft, booking prep —
and `ActionDetail` is shared so both states show the same content when opened.
A completed step shows its state inline and is excluded from the "Completed"
section, which lists only tasks finished before the plan existed.

The first unfinished step is emphasised, because the question people arrive
with is "what do I do now?", not "show me everything".

### Three things the model gets wrong unless constrained

Learned by watching it, not by guessing:

1. **Dates ran backwards.** `doBy` was being read as "when the authority
   replies", so a slow task landed last despite being first in the order. The
   prompt now defines `doBy` as *when the person must have done their part*, and
   the route clamps dates to be non-decreasing as a safety net.
2. **Reasoning contradicted position** — a step explained as urgent, scheduled
   last. The prompt now requires the two to agree.
3. **`authorityId` was sometimes omitted**, which silently cost the user the
   booking preparation. `findAuthorityFor()` resolves it from the task's own
   authority string and category, so the feature no longer depends on the model
   remembering a field.

Caveats and the summary are for the *user*: a gap in our own tool data is not a
caveat, and the summary must not recite the steps listed underneath.

### The boundary — do not move it

**The app never sends a message and never books an appointment.** It drafts, and
the user sends from their own mail client (`mailto:`) or books through the
authority's own page. Three reasons this is not timidity:

1. There is no auth. Anything the app sent would be mail from an unverified
   party in someone else's name.
2. Public appointment slots are scarce. An agent booking speculatively takes
   them from people who need them.
3. Automated booking against government portals generally breaches their terms,
   and anything CAPTCHA-protected is off limits.

Drafting is where the value is anyway: "write a formal German letter to a
Krankenkasse" is the part a 22-year-old Dutch student genuinely cannot do.

### Two things that are honest MVP shortcuts

- **Jobs live in a module-level `Map`.** A dev-server restart loses running
  jobs, and it will not work across instances. Replace with a real queue before
  deploying anywhere that scales.
- **`lib/authorities.ts` is demo content.** The URLs are real entry points, but
  the lead times are indicative and the registry is incomplete. Every row needs
  verifying against the authority itself. A better prompt cannot fix wrong data.

Calendar export builds an `.ics` in `lib/scheduling.ts` — a file the user
imports, so it needs no calendar account, no OAuth and no access to anyone's
calendar. Placeholders in drafts are extracted from the draft text with a regex
rather than trusted from the model, because a forgotten entry means someone
posts a letter still reading `[Naam werkgever]`.

### Personal details never reach the model

`lib/personal-details.ts` holds the user's own identifying data — name, date of
birth, address, BSN, Steuer-ID, insurance number — in `localStorage`, and
substitutes it into drafts **in the browser, after the answer comes back**.

The agent writes `[BSN]`; `fillDraft()` turns it into a number on the device.
This is not a limitation to work around, it is the point: a BSN and a date of
birth are exactly the data you do not send to a third-party API to have it typed
back to you, and the letter is no worse for it.

Matching is on a normalised token, with per-field aliases across languages, so
`[Ihr Name]`, `[Uw Naam]` and `[Naam]` all resolve. Dates are rendered in the
target country's convention (`17.04.2001` for Germany, `17-04-2001` for NL).
Anything unmatched stays visible as a placeholder and is reported as missing —
never silently blanked.

**Do not send `PersonalDetails` to any route handler.** If a feature seems to
need that, it does not — the substitution belongs on the client.

### Appointment preparation, not booking

`Authority.services[]` describes bookable services: which entry to pick in the
portal's list, how to navigate there, what to bring, what the form asks. The
`BookingPrepPanel` puts the user's stored answers next to each field with a copy
button.

This deliberately stops short of booking. Municipal portals are CAPTCHA-guarded,
a booking is irreversible and made in the user's name, it consumes a scarce
public slot, automated access generally breaches portal terms, and the app has
no authentication to establish who is booking. The user's own data does not
change any of that — it solves filling, not committing.

`serviceName` and `navigationHint` are the most perishable content in the repo;
portals rename their service lists. They are written as navigation hints rather
than deep links for that reason, and the panel tells the user to look for the
closest match.

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
| `lib/scheduling.ts`, `lib/schedule-prompt.ts` | the scheduling agent and its tools |
| `app/api/schedule/route.ts` | the background job runner |
| `components/actions/schedule-*.tsx`, `email-draft-panel.tsx` | planner UI |

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
| `lib/authorities.ts` | **authority registry — needs verifying against each authority** |

### Shared — change by agreement

`lib/types.ts` · `lib/constants.ts` · `lib/storage.ts` · `hooks/use-profile.ts`

---

## 5. How to run the project

Requires Node 20 or newer — `.nvmrc` and the `engines` field pin it.

```bash
npm ci               # use ci, not install: it honours the lockfile exactly
npm run dev          # http://localhost:3000
```

The app runs with no key and no configuration; the AI features fall back to
mocks. See the README for enabling them. Each developer uses their own key.

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
| `OPENAI_API_KEY` | Read by the three route handlers under `app/api/`, server-side only. Without it Ask and upload fall back to their mock; the planner reports that it is not configured. |
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
14. **Borderless does not act on a user's behalf towards a third party.** It
    drafts and it links; the user sends and books. Do not add an outbox, an
    email service that writes to authorities, or automated form filling on a
    booking portal. If a feature needs the app to press "send", it needs a
    design discussion first, not a pull request.
15. Facts about authorities — channels, waiting times, whether an appointment is
    needed — live in `lib/authorities.ts` and reach the model through tools.
    Never let a prompt generate them.
16. The user's identifying details (`PersonalDetails`) stay on the device. They
    are substituted into drafts client-side and must never be put in a prompt,
    a request body or a log.

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

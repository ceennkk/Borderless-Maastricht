/**
 * Borderless rule engine — public interface.
 *
 * This module is the *only* place business logic lives. UI components call
 * `analyzeProfile` and `simulateChange` and render whatever comes back; they
 * never reason about countries, hours or insurance themselves.
 *
 * The current implementation is deliberately shallow: a handful of
 * demo-quality heuristics that produce plausible, well-shaped output. Replacing
 * them with a real engine means rewriting the bodies of the `rule*` functions
 * below — the exported signatures stay exactly as they are.
 *
 * ⚠ Not legal advice. Every string here is placeholder content.
 */
import {
  COUNTRY_META,
  IMPACT_CATEGORY_ORDER,
  IMPACT_STATUS_META,
  LIFE_CHANGE_META,
} from "./constants";
import { SOURCES } from "./mock-data";
import type {
  Action,
  Country,
  Impact,
  ImpactStatus,
  LifeChange,
  SimulationResult,
  SituationRow,
  UserProfile,
} from "./types";

/* ========================================================================== */
/* Public API                                                                 */
/* ========================================================================== */

/**
 * Work out what the user's current situation means for them.
 * Returns one Impact per relevant category, in display order.
 */
export function analyzeProfile(profile: UserProfile): Impact[] {
  const impacts = [
    ruleHealthInsurance(profile),
    ruleSocialSecurity(profile),
    ruleTax(profile),
    ruleRegistration(profile),
    ruleEmployment(profile),
    ruleStudentStatus(profile),
    ruleResidence(profile),
  ].filter((i): i is Impact => i !== null);

  return sortImpacts(impacts);
}

/**
 * Apply a hypothetical change and report what it would mean.
 *
 * The UI renders the returned object directly, so a future engine can change
 * *what* it says without the simulator needing edits.
 */
export function simulateChange(profile: UserProfile, change: LifeChange): SimulationResult {
  const proposedProfile = applyChange(profile, change);
  const before = analyzeProfile(profile);
  const after = analyzeProfile(proposedProfile);

  return {
    change,
    currentProfile: profile,
    proposedProfile,
    impacts: markChangedImpacts(before, after),
    summary: summariseSimulation(proposedProfile, change, after),
  };
}

/** Produce the resulting profile for a change, without analysing it. */
export function applyChange(profile: UserProfile, change: LifeChange): UserProfile {
  const merged: UserProfile = { ...profile, ...change.patch };

  // Keep dependent fields coherent — a profile that says "not employed" must
  // not keep a work country, or the comparison view shows nonsense.
  if (merged.isEmployed === false) {
    merged.workCountry = undefined;
    merged.workCity = undefined;
    merged.workHoursPerWeek = undefined;
    merged.remoteWorkDaysPerWeek = undefined;
  }
  if (merged.isStudent === false) {
    merged.studyCountry = undefined;
    merged.studyCity = undefined;
  }
  return merged;
}

/** Flatten the actions attached to a set of impacts, de-duplicated by id. */
export function deriveActions(impacts: Impact[]): Action[] {
  const seen = new Map<string, Action>();
  for (const impact of impacts) {
    for (const action of impact.actions) {
      if (!seen.has(action.id)) seen.set(action.id, { ...action, impactId: impact.id });
    }
  }
  return Array.from(seen.values());
}

/** Rows for the CURRENT → PROPOSED comparison table. */
export function buildSituationRows(
  current: UserProfile,
  proposed: UserProfile,
): SituationRow[] {
  const rows: Array<[string, (p: UserProfile) => string]> = [
    ["Live", (p) => place(p.residenceCountry, p.residenceCity)],
    ["Study", (p) => (p.isStudent ? place(p.studyCountry, p.studyCity) : "None")],
    ["Work", (p) => (p.isEmployed ? place(p.workCountry, p.workCity) : "None")],
    ["Hours", (p) => (p.isEmployed && p.workHoursPerWeek ? `${p.workHoursPerWeek}h / week` : "—")],
    [
      "Remote",
      (p) =>
        p.isEmployed && p.remoteWorkDaysPerWeek
          ? `${p.remoteWorkDaysPerWeek} day${p.remoteWorkDaysPerWeek === 1 ? "" : "s"} / week`
          : "—",
    ],
    ["Insurance", (p) => (p.healthInsuranceCountry ? countryName(p.healthInsuranceCountry) : "—")],
  ];

  return rows.map(([label, get]) => {
    const a = get(current);
    const b = get(proposed);
    return { label, current: a, proposed: b, changed: a !== b };
  });
}

/** Highest severity present, for headline counts. */
export function worstStatus(impacts: Impact[]): ImpactStatus {
  return impacts.reduce<ImpactStatus>((worst, i) => {
    return IMPACT_STATUS_META[i.status].weight > IMPACT_STATUS_META[worst].weight ? i.status : worst;
  }, "OK");
}

/** How many impacts need the user's attention (CHECK or ACTION). */
export function countNeedingAttention(impacts: Impact[]): number {
  return impacts.filter((i) => i.status !== "OK").length;
}

/* ========================================================================== */
/* Rules — replace these bodies with the real engine                          */
/* ========================================================================== */

/** Below this, employment is likely to count as marginal (mini-job territory). */
const MARGINAL_HOURS_PER_WEEK = 12;

/** Above this, a student's workload starts to affect income-linked benefits. */
const SUBSTANTIAL_HOURS_PER_WEEK = 25;

function ruleHealthInsurance(p: UserProfile): Impact {
  const worksAbroad = p.isEmployed && p.workCountry && p.workCountry !== p.residenceCountry;
  const insuredWhereWorking = p.healthInsuranceCountry === p.workCountry;

  if (worksAbroad && !insuredWhereWorking) {
    return impact({
      id: "imp_health",
      category: "HEALTH_INSURANCE",
      status: "ACTION",
      title: "Your insurance country is likely to change",
      explanation: `You live in ${countryName(p.residenceCountry)} but work in ${countryName(p.workCountry!)}. In most cases the country you work in insures you, which means your current policy has to be replaced.`,
      actions: [
        action({
          id: "act_health_check",
          title: "Check your health insurance status",
          description: `Confirm whether ${countryName(p.workCountry!)} now insures you, and what happens to your existing policy.`,
          category: "HEALTH_INSURANCE",
          authority: "Health insurer / Krankenkasse",
          why: "Paying for a policy you are no longer entitled to is a common and expensive mistake for cross-border workers.",
          steps: [
            "Ask your employer which insurer you have been registered with.",
            "Request the form that extends cover to your country of residence (S1).",
            "Speak to your current insurer before cancelling anything.",
          ],
          documents: ["Employment contract", "Current policy number", "ID"],
          source: SOURCES.zorgverzekering,
        }),
      ],
      sources: [SOURCES.zorgverzekering, SOURCES.krankenkasse],
    });
  }

  if (worksAbroad) {
    return impact({
      id: "imp_health",
      category: "HEALTH_INSURANCE",
      status: "CHECK",
      title: "Confirm your cover works on both sides",
      explanation: `You are insured in ${countryName(p.healthInsuranceCountry!)} and work across the border. Make sure your cover also applies where you live.`,
      sources: [SOURCES.zorgverzekering],
    });
  }

  return impact({
    id: "imp_health",
    category: "HEALTH_INSURANCE",
    status: "OK",
    title: "Your health insurance matches where you live",
    explanation: `You are insured in ${countryName(p.healthInsuranceCountry ?? p.residenceCountry)}, the country you live in. Nothing to do.`,
    sources: [SOURCES.zorgverzekering],
  });
}

function ruleSocialSecurity(p: UserProfile): Impact {
  if (!p.isEmployed) {
    return impact({
      id: "imp_social",
      category: "SOCIAL_SECURITY",
      status: "OK",
      title: "No cross-border social security question yet",
      explanation:
        "Without employment there is nothing to allocate between countries. This changes the day you start working.",
      sources: [SOURCES.svb],
    });
  }

  const crossBorder = p.workCountry && p.workCountry !== p.residenceCountry;
  const splitsWork = (p.remoteWorkDaysPerWeek ?? 0) > 0;

  if (crossBorder && splitsWork) {
    return impact({
      id: "imp_social",
      category: "SOCIAL_SECURITY",
      status: "ACTION",
      title: "Working from home can move your social security",
      explanation: `You work ${p.remoteWorkDaysPerWeek} day(s) a week from ${countryName(p.residenceCountry)}. Past a significant share, your country of residence takes over your social security.`,
      actions: [
        action({
          id: "act_a1_certificate",
          title: "Request an A1 certificate",
          description:
            "An A1 proves which country's social security applies to you. Employers and authorities on both sides ask for it.",
          category: "SOCIAL_SECURITY",
          authority: "Sociale Verzekeringsbank (SVB)",
          why: "Without an A1 you risk contributions being claimed in both countries — and gaps in your pension record.",
          steps: [
            "Ask your employer to apply, or apply yourself at the SVB.",
            "State clearly how many days a week you work from home.",
          ],
          documents: ["Employment contract", "Home-working agreement"],
          source: SOURCES.svb,
        }),
      ],
      sources: [SOURCES.svb, SOURCES.grensinfo],
    });
  }

  if (crossBorder) {
    return impact({
      id: "imp_social",
      category: "SOCIAL_SECURITY",
      status: "CHECK",
      title: "One country collects your contributions",
      explanation: `Your job in ${countryName(p.workCountry!)} probably places you under that country's social security. Confirm it — your pension and unemployment rights follow that choice.`,
      actions: [
        action({
          id: "act_social_security",
          title: "Verify your social security situation",
          description: "Find out which country's system you belong to, and get it in writing.",
          category: "SOCIAL_SECURITY",
          authority: "Sociale Verzekeringsbank (SVB)",
          why: "Your pension build-up, unemployment rights and family benefits all follow the country whose social security system you belong to.",
          steps: [
            "Contact the SVB (or its counterpart) with your work details.",
            "Ask about an A1 certificate if you work in more than one country.",
            "Keep the outcome — you will need it at tax time.",
          ],
          documents: ["Employment contract", "Proof of address"],
          source: SOURCES.svb,
        }),
      ],
      sources: [SOURCES.svb, SOURCES.grensinfo],
    });
  }

  return impact({
    id: "imp_social",
    category: "SOCIAL_SECURITY",
    status: "OK",
    title: "You are covered where you live",
    explanation: `You live and work in ${countryName(p.residenceCountry)}, so one social security system applies.`,
    sources: [SOURCES.svb],
  });
}

function ruleTax(p: UserProfile): Impact {
  if (!p.isEmployed || !p.workCountry) {
    return impact({
      id: "imp_tax",
      category: "TAX",
      status: "OK",
      title: "Nothing to declare across the border",
      explanation: "Without cross-border income, you file only where you live.",
      sources: [SOURCES.belastingdienst],
    });
  }

  if (p.workCountry === p.residenceCountry) {
    return impact({
      id: "imp_tax",
      category: "TAX",
      status: "OK",
      title: "One tax authority",
      explanation: `You earn and live in ${countryName(p.residenceCountry)}, so only one tax office is involved.`,
      sources: [SOURCES.belastingdienst],
    });
  }

  return impact({
    id: "imp_tax",
    category: "TAX",
    status: "ACTION",
    title: "You will deal with two tax authorities",
    explanation: `Income earned in ${countryName(p.workCountry)} is generally taxed there, but ${countryName(p.residenceCountry)} still expects a return declaring it. A tax treaty stops you paying twice.`,
    actions: [
      action({
        id: "act_tax_review",
        title: "Review cross-border tax implications",
        description: `Understand where your salary is taxed and what you still have to declare in ${countryName(p.residenceCountry)}.`,
        category: "TAX",
        authority: "Belastingdienst / Finanzamt",
        why: "Cross-border workers often overpay simply because they never claimed the relief the treaty entitles them to.",
        steps: [
          "Request a tax number in your country of work.",
          "Keep every payslip and the annual statement.",
          "Declare the foreign income at home and claim double-taxation relief.",
        ],
        documents: ["Payslips", "Annual income statement", "Tax number"],
        source: SOURCES.belastingdienst,
      }),
      action({
        id: "act_tax_number",
        title: `Request a tax identification number in ${countryName(p.workCountry)}`,
        description: "Without it, your employer withholds tax at the highest rate.",
        category: "TAX",
        authority: "Local tax office",
        why: "Employers apply an emergency tax class until your number is on file. Sorting it out early avoids months of over-withholding.",
        steps: ["Ask HR whether they apply on your behalf.", "Otherwise apply at the local tax office."],
        documents: ["Passport or ID card", "Employment contract"],
        source: SOURCES.grensinfo,
      }),
    ],
    sources: [SOURCES.belastingdienst, SOURCES.grensinfo],
  });
}

function ruleRegistration(p: UserProfile): Impact {
  return impact({
    id: "imp_registration",
    category: "REGISTRATION",
    status: "OK",
    title: `Your registration in ${p.residenceCity || countryName(p.residenceCountry)} is in order`,
    explanation:
      "Almost everything else — insurance, tax, student finance — reads from your municipal registration. It only needs attention when your address changes.",
    sources: [SOURCES.gemeente],
  });
}

function ruleEmployment(p: UserProfile): Impact | null {
  if (!p.isEmployed || !p.workCountry) return null;

  const hours = p.workHoursPerWeek ?? 0;
  const crossBorder = p.workCountry !== p.residenceCountry;

  // Marginal employment (mini-jobs and the like) sits under earnings thresholds
  // that change contributions and entitlements — that is worth a second look.
  if (crossBorder && hours > 0 && hours <= MARGINAL_HOURS_PER_WEEK) {
    return impact({
      id: "imp_employment",
      category: "EMPLOYMENT",
      status: "CHECK",
      title: "Your hours put you near an earnings threshold",
      explanation: `At ${hours} hours a week in ${countryName(p.workCountry)}, you may fall under a marginal-employment scheme with different contributions and entitlements.`,
      sources: [SOURCES.arbeitsagentur, SOURCES.grensinfo],
    });
  }

  return impact({
    id: "imp_employment",
    category: "EMPLOYMENT",
    status: "OK",
    title: crossBorder
      ? `${countryAdjective(p.workCountry)} employment rules apply to your contract`
      : "Standard employment rules apply",
    explanation: crossBorder
      ? `Your contract follows ${countryAdjective(p.workCountry)} labour law, even though you live in ${countryName(p.residenceCountry)}. Nothing to arrange — your employer applies it.`
      : "You work in the country you live in, so the usual national rules apply.",
    sources: [SOURCES.arbeitsagentur],
  });
}

function ruleStudentStatus(p: UserProfile): Impact | null {
  if (!p.isStudent) return null;

  const where = p.studyCity || countryName(p.studyCountry ?? p.residenceCountry);

  // Enrolment itself survives a job abroad. What can break is the income-linked
  // side of student status, and that only bites above a substantial workload.
  if (p.isEmployed && (p.workHoursPerWeek ?? 0) > SUBSTANTIAL_HOURS_PER_WEEK) {
    return impact({
      id: "imp_student",
      category: "STUDENT_STATUS",
      status: "CHECK",
      title: "Working this much can affect student benefits",
      explanation: `You stay enrolled in ${where}, but at ${p.workHoursPerWeek} hours a week the income-linked parts of student status — allowances, insurance rates — may no longer apply.`,
      sources: [SOURCES.duo],
    });
  }

  return impact({
    id: "imp_student",
    category: "STUDENT_STATUS",
    status: "OK",
    title: "Your student status is unaffected",
    explanation: `You remain enrolled in ${where}. Working across the border does not change your enrolment.`,
    sources: [SOURCES.duo],
  });
}

function ruleResidence(p: UserProfile): Impact {
  if (p.euCitizen) {
    return impact({
      id: "imp_residence",
      category: "RESIDENCE",
      status: "OK",
      title: "Your right to live here is secure",
      explanation: `As an EU citizen you can live in ${countryName(p.residenceCountry)} and work anywhere in the Euregio without a permit.`,
      sources: [SOURCES.euraxess],
    });
  }

  return impact({
    id: "imp_residence",
    category: "RESIDENCE",
    status: "ACTION",
    title: "Your residence permit sets the rules",
    explanation:
      "As a non-EU citizen, the conditions on your permit decide where and how much you may work. Check them before anything changes.",
    actions: [
      action({
        id: "act_residence_permit",
        title: "Check what your residence permit allows",
        description: "Work restrictions, hour limits and cross-border conditions vary per permit type.",
        category: "RESIDENCE",
        authority: "IND / Ausländerbehörde",
        why: "Working outside your permit's conditions can put your right to stay at risk.",
        steps: ["Read the conditions printed on your permit.", "Ask the issuing authority about work across the border."],
        documents: ["Residence permit", "Passport"],
        source: SOURCES.euraxess,
      }),
    ],
    sources: [SOURCES.euraxess],
  });
}

/* ========================================================================== */
/* Internals                                                                  */
/* ========================================================================== */

function impact(input: Omit<Impact, "actions" | "sources"> & Partial<Pick<Impact, "actions" | "sources">>): Impact {
  return { actions: [], sources: [], ...input };
}

function action(input: Omit<Action, "completed">): Action {
  return { completed: false, ...input };
}

function sortImpacts(impacts: Impact[]): Impact[] {
  return [...impacts].sort(
    (a, b) => IMPACT_CATEGORY_ORDER.indexOf(a.category) - IMPACT_CATEGORY_ORDER.indexOf(b.category),
  );
}

/** Surface impacts whose status got worse after the change, first. */
function markChangedImpacts(before: Impact[], after: Impact[]): Impact[] {
  const previous = new Map(before.map((i) => [i.category, i.status]));
  return [...after].sort((a, b) => {
    const changedA = previous.get(a.category) !== a.status ? 1 : 0;
    const changedB = previous.get(b.category) !== b.status ? 1 : 0;
    if (changedA !== changedB) return changedB - changedA;
    return IMPACT_STATUS_META[b.status].weight - IMPACT_STATUS_META[a.status].weight;
  });
}

function summariseSimulation(
  proposed: UserProfile,
  change: LifeChange,
  impacts: Impact[],
): string {
  const needsAttention = countNeedingAttention(impacts);
  const label = LIFE_CHANGE_META[change.type].label.toLowerCase();

  if (needsAttention === 0) {
    return `${capitalise(label)} would not change anything you need to act on.`;
  }
  return `${capitalise(label)} would affect ${needsAttention} area${needsAttention === 1 ? "" : "s"} of your administrative life.`;
}

function place(country?: Country, city?: string): string {
  if (!country) return "None";
  const name = countryName(country);
  return city ? `${city}, ${name}` : name;
}

function countryName(code: Country): string {
  return { NL: "the Netherlands", DE: "Germany", BE: "Belgium" }[code];
}

/** "Dutch" / "German" / "Belgian" — for titles where an article would read badly. */
function countryAdjective(code: Country): string {
  return COUNTRY_META[code].adjective;
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

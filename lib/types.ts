/**
 * Borderless — shared data model.
 *
 * This file is the contract between all feature areas (UI, rule engine, AI layer).
 * Changing an exported type here affects every developer, so treat it as a shared
 * interface: additive changes are cheap, renames and removals are not.
 */

/* ------------------------------------------------------------------ */
/* Geography                                                           */
/* ------------------------------------------------------------------ */

/** The three countries of the Maastricht Euregio. */
export type Country = "NL" | "DE" | "BE";

/**
 * Whether the person is registered with their city of residence
 * (BRP in NL, Einwohnermeldeamt in DE, gemeente in BE).
 *
 * `in_progress` means the registration has been started but is not yet
 * confirmed — the UI surfaces this as a pending state.
 */
export type RegistrationStatus = "registered" | "not_registered" | "in_progress";

/* ------------------------------------------------------------------ */
/* User                                                                */
/* ------------------------------------------------------------------ */

export interface UserProfile {
  id: string;
  name: string;

  /** Where the person officially lives. Always known. */
  residenceCountry: Country;
  residenceCity: string;
  /** Whether the person is registered with their city of residence. */
  registrationStatus?: RegistrationStatus;

  isStudent: boolean;
  /** Only meaningful when `isStudent` is true. */
  studyCountry?: Country;
  studyCity?: string;

  isEmployed: boolean;
  /** Only meaningful when `isEmployed` is true. */
  workCountry?: Country;
  workCity?: string;
  workHoursPerWeek?: number;
  /** Days per week worked from the country of residence instead of the work country. */
  remoteWorkDaysPerWeek?: number;

  /** Free text, e.g. "German", "Turkish". */
  citizenship: string;
  euCitizen: boolean;

  healthInsuranceCountry?: Country;

  /** ISO timestamps, set by the storage layer. */
  createdAt?: string;
  updatedAt?: string;
}

/* ------------------------------------------------------------------ */
/* Life changes                                                        */
/* ------------------------------------------------------------------ */

export type LifeChangeType =
  | "NEW_JOB"
  | "MOVE"
  | "REMOTE_WORK"
  | "CHANGE_WORK_HOURS"
  | "GRADUATION"
  | "START_STUDY"
  | "CHANGE_EMPLOYER";

/**
 * A change the user is considering or has gone through.
 *
 * `patch` holds the profile fields the change would produce. Keeping the payload
 * as a profile patch means the rule engine never has to special-case a change
 * type just to work out the resulting situation — see `applyChange` in rules.ts.
 */
export interface LifeChange {
  type: LifeChangeType;
  patch: Partial<UserProfile>;
  /** ISO date, optional — when the change takes effect. */
  effectiveDate?: string;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* Impacts                                                             */
/* ------------------------------------------------------------------ */

export type ImpactCategory =
  | "HEALTH_INSURANCE"
  | "SOCIAL_SECURITY"
  | "TAX"
  | "REGISTRATION"
  | "RESIDENCE"
  | "EMPLOYMENT"
  | "STUDENT_STATUS";

/**
 * OK     — nothing to do right now.
 * CHECK  — the situation may change; the user should verify.
 * ACTION — something concrete must be done.
 */
export type ImpactStatus = "OK" | "CHECK" | "ACTION";

/** A citation to an official body or information portal. */
export interface Source {
  label: string;
  url: string;
  /** Issuing authority, e.g. "Belastingdienst", "Krankenkasse". */
  authority?: string;
}

export interface Impact {
  id: string;
  category: ImpactCategory;
  status: ImpactStatus;
  title: string;
  /** One or two sentences, plain language. Longer prose belongs in an Action. */
  explanation: string;
  actions: Action[];
  sources: Source[];
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export interface Action {
  id: string;
  title: string;
  description: string;
  category: ImpactCategory;
  completed: boolean;

  /** ISO date. */
  deadline?: string;
  /** The body the user deals with, e.g. "Gemeente Maastricht". */
  authority?: string;
  source?: Source;

  /* Detail-view fields — optional so a rule can emit a minimal action. */
  /** Why this matters to *this* user. */
  why?: string;
  /** Concrete steps to take. */
  steps?: string[];
  /** Documents to bring or prepare. */
  documents?: string[];
  /** The impact this action was generated from, when there is one. */
  impactId?: string;
}

/* ------------------------------------------------------------------ */
/* Opportunities                                                       */
/* ------------------------------------------------------------------ */

export type OpportunityCategory =
  | "TRANSPORT"
  | "STUDENT"
  | "WORK"
  | "FINANCE"
  | "SERVICES"
  | "COMMUNITY";

/**
 * Something the user *could* benefit from — deliberately separate from Impact,
 * which is about obligations.
 */
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: OpportunityCategory;
  /** Why this user qualifies (or might). */
  eligibility: string;
  source: Source;
  /** Countries this is relevant for; empty/undefined means all. */
  countries?: Country[];
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export type DocumentType =
  | "EMPLOYMENT_CONTRACT"
  | "PAYSLIP"
  | "A1_CERTIFICATE"
  | "S1_FORM"
  | "INSURANCE_PROOF"
  | "REGISTRATION_PROOF"
  | "ENROLMENT_PROOF"
  | "TAX_ASSESSMENT"
  | "RESIDENCE_PERMIT"
  | "OTHER";

/** How much the analyser trusts its own reading. Never hide this from the user. */
export type AnalysisConfidence = "high" | "medium" | "low";

export interface DocumentDeadline {
  label: string;
  /** ISO date. */
  date: string;
}

/**
 * The result of reading one document.
 *
 * `extracted` is deliberately a `Partial<UserProfile>` — the same shape as
 * `LifeChange.patch` — so a document flows into the existing rule engine
 * without any new logic. See `toLifeChange` in lib/documents.ts.
 *
 * The file itself is never stored: only this analysis is.
 */
export interface DocumentAnalysis {
  id: string;
  documentType: DocumentType;
  issuingCountry?: Country;
  /** Two sentences of plain language: what this is, why it matters. */
  summary: string;
  extracted: Partial<UserProfile>;
  /** The life change this document appears to document, if any. */
  detectedChange?: LifeChangeType;
  deadlines: DocumentDeadline[];
  confidence: AnalysisConfidence;
  /** What the document did not state — shown so the user can fill the gaps. */
  missingInfo: string[];
  /** Display only. The file is processed in memory and discarded. */
  fileName?: string;
  analysedAt?: string;
}

/* ------------------------------------------------------------------ */
/* Scheduling                                                          */
/* ------------------------------------------------------------------ */

/** How the user deals with an authority. Decides what the planner offers. */
export type ContactChannel = "ONLINE" | "IN_PERSON" | "POST" | "PHONE" | "EMAIL";

/**
 * One bookable service at an authority.
 *
 * The hard part of a municipal portal is not clicking — it is finding which of
 * forty "Dienstleistungen" is yours, and knowing what to bring. That is what
 * this captures.
 */
export interface BookingService {
  id: string;
  /** Exactly what to select in the portal's service list. */
  serviceName: string;
  /** What it is for, in plain language. */
  purpose: string;
  /** Where to start. May be the portal root rather than a deep link. */
  url: string;
  /** How to get there once on the site, when there is no deep link. */
  navigationHint?: string;
  documents: string[];
  /** What the form asks for. `detailKey` links to a stored personal detail. */
  formFields: Array<{ label: string; detailKey?: string }>;
  fee?: string;
  notes?: string;
}

export interface Authority {
  id: string;
  name: string;
  country: Country;
  city?: string;
  /** What this body actually handles, in plain language. */
  handles: string;
  categories: ImpactCategory[];
  channels: ContactChannel[];
  /** True when you cannot simply walk in. */
  appointmentRequired: boolean;
  /** Typical wait in days [min, max]. Indicative only — always verify. */
  typicalLeadTimeDays: [number, number];
  bookingUrl?: string;
  infoUrl: string;
  email?: string;
  /** Language to write in. */
  language: "nl" | "de" | "fr" | "en";
  /** Bookable services, when this authority has any. */
  services?: BookingService[];
}

/** A drafted message. Never sent by the app — the user sends it. */
export interface MessageDraft {
  subject: string;
  body: string;
  language: Authority["language"];
  /** Placeholders the user must fill before sending, e.g. "BSN". */
  placeholders: string[];
}

export interface ScheduleItem {
  actionId: string;
  title: string;
  authorityId?: string;
  /** 1-based position in the sequence. */
  order: number;
  /** ISO date — earliest sensible start. */
  startAfter?: string;
  /** ISO date — the date the plan targets. */
  doBy: string;
  channel: ContactChannel;
  appointmentRequired: boolean;
  /** Why this sits here in the order. One sentence. */
  reasoning: string;
  /** Present when a message makes sense for this step. */
  draft?: MessageDraft;
}

export interface SchedulePlan {
  items: ScheduleItem[];
  /** One or two sentences framing the plan. */
  summary: string;
  /** The date everything is counted from. */
  anchorDate: string;
  generatedAt: string;
  /** Anything the planner could not settle. */
  caveats: string[];
}

export type ScheduleJobStatus = "queued" | "running" | "done" | "error";

/** A background planning run the client polls. */
export interface ScheduleJob {
  id: string;
  status: ScheduleJobStatus;
  /** What the agent is doing right now, for the progress display. */
  step: string;
  /** Completed steps, oldest first. */
  log: string[];
  plan?: SchedulePlan;
  error?: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Engine results                                                      */
/* ------------------------------------------------------------------ */

/** What `simulateChange` returns. The simulator UI renders exactly this shape. */
export interface SimulationResult {
  change: LifeChange;
  currentProfile: UserProfile;
  proposedProfile: UserProfile;
  impacts: Impact[];
  /** One-line summary of the outcome, shown above the impact list. */
  summary: string;
}

/** A single row in the current/proposed comparison table. */
export interface SituationRow {
  label: string;
  current: string;
  proposed: string;
  changed: boolean;
}

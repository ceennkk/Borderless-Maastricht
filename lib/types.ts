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

/* ------------------------------------------------------------------ */
/* User                                                                */
/* ------------------------------------------------------------------ */

export interface UserProfile {
  id: string;
  name: string;

  /** Where the person officially lives. Always known. */
  residenceCountry: Country;
  residenceCity: string;

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

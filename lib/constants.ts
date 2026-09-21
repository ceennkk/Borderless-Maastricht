/**
 * Presentation metadata for the shared enums in types.ts.
 *
 * UI code should read labels, colours and icons from here rather than
 * hard-coding strings, so a new category only has to be described once.
 */
import type {
  Country,
  ImpactCategory,
  ImpactStatus,
  LifeChangeType,
  OpportunityCategory,
} from "./types";

export const COUNTRIES: Country[] = ["NL", "DE", "BE"];

export const COUNTRY_META: Record<
  Country,
  { name: string; flag: string; adjective: string; cities: string[] }
> = {
  NL: {
    name: "Netherlands",
    flag: "🇳🇱",
    adjective: "Dutch",
    cities: ["Maastricht", "Heerlen", "Sittard", "Eindhoven", "Roermond", "Venlo"],
  },
  DE: {
    name: "Germany",
    flag: "🇩🇪",
    adjective: "German",
    cities: ["Aachen", "Cologne", "Düsseldorf", "Heinsberg", "Mönchengladbach", "Geilenkirchen"],
  },
  BE: {
    name: "Belgium",
    flag: "🇧🇪",
    adjective: "Belgian",
    cities: ["Hasselt", "Liège", "Tongeren", "Leuven", "Genk", "Maasmechelen"],
  },
};

export const IMPACT_CATEGORY_META: Record<
  ImpactCategory,
  { label: string; short: string; description: string }
> = {
  HEALTH_INSURANCE: {
    label: "Health Insurance",
    short: "Health",
    description: "Which country insures you, and whether your cover still applies.",
  },
  SOCIAL_SECURITY: {
    label: "Social Security",
    short: "Social",
    description: "Where your pension, unemployment and benefit rights are built up.",
  },
  TAX: {
    label: "Taxes",
    short: "Tax",
    description: "Where your income is taxed and where you file a return.",
  },
  REGISTRATION: {
    label: "Registration",
    short: "Registration",
    description: "Municipal registration, tax numbers and official addresses.",
  },
  RESIDENCE: {
    label: "Residence",
    short: "Residence",
    description: "Your right to live in the country you call home.",
  },
  EMPLOYMENT: {
    label: "Employment",
    short: "Employment",
    description: "Contracts, working hours and employment rules that apply to you.",
  },
  STUDENT_STATUS: {
    label: "Student Status",
    short: "Student",
    description: "Your enrolment and the benefits that depend on it.",
  },
};

/** Fixed display order for dashboard cards and impact lists. */
export const IMPACT_CATEGORY_ORDER: ImpactCategory[] = [
  "HEALTH_INSURANCE",
  "SOCIAL_SECURITY",
  "TAX",
  "REGISTRATION",
  "EMPLOYMENT",
  "STUDENT_STATUS",
  "RESIDENCE",
];

export const IMPACT_STATUS_META: Record<
  ImpactStatus,
  { label: string; hint: string; weight: number }
> = {
  OK: { label: "OK", hint: "Nothing to do right now", weight: 0 },
  CHECK: { label: "Check", hint: "Worth verifying", weight: 1 },
  ACTION: { label: "Action required", hint: "Something needs doing", weight: 2 },
};

export const LIFE_CHANGE_META: Record<
  LifeChangeType,
  { label: string; question: string; description: string }
> = {
  NEW_JOB: {
    label: "Starting a job",
    question: "Where would you work?",
    description: "A first job, or a job in another country.",
  },
  MOVE: {
    label: "Moving",
    question: "Where would you move to?",
    description: "Changing the country or city you live in.",
  },
  REMOTE_WORK: {
    label: "Working remotely",
    question: "How many days from home?",
    description: "Working from your country of residence instead of commuting.",
  },
  CHANGE_WORK_HOURS: {
    label: "Changing work hours",
    question: "How many hours per week?",
    description: "Working more or fewer hours than today.",
  },
  GRADUATION: {
    label: "Graduating",
    question: "When do you finish?",
    description: "Ending your studies and leaving student status behind.",
  },
  START_STUDY: {
    label: "Starting to study",
    question: "Where would you study?",
    description: "Enrolling at a university or college.",
  },
  CHANGE_EMPLOYER: {
    label: "Changing employer",
    question: "Where is the new employer?",
    description: "A new employer, possibly in another country.",
  },
};

/** The five options offered on the simulator landing screen. */
export const SIMULATOR_CHANGE_TYPES: LifeChangeType[] = [
  "NEW_JOB",
  "MOVE",
  "REMOTE_WORK",
  "CHANGE_WORK_HOURS",
  "GRADUATION",
];

export const OPPORTUNITY_CATEGORY_META: Record<
  OpportunityCategory,
  { label: string }
> = {
  TRANSPORT: { label: "Transport" },
  STUDENT: { label: "Student life" },
  WORK: { label: "Work" },
  FINANCE: { label: "Money" },
  SERVICES: { label: "Services" },
  COMMUNITY: { label: "Community" },
};

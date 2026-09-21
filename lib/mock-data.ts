/**
 * Demo content for the hackathon MVP.
 *
 * Nothing here is legal advice — it exists so the UI has realistic shapes to
 * render before the rule engine and knowledge base are real. Every export is
 * plain data: no React, no side effects.
 */
import type { Action, Impact, Opportunity, Source, UserProfile } from "./types";

/* --------------------------------- sources -------------------------------- */

export const SOURCES: Record<string, Source> = {
  grensinfo: {
    label: "Grensinfopunt — working across the border",
    url: "https://www.grenzinfo.eu/",
    authority: "Grensinfopunt / GrenzInfoPunkt",
  },
  belastingdienst: {
    label: "Belastingdienst — living or working abroad",
    url: "https://www.belastingdienst.nl/",
    authority: "Belastingdienst",
  },
  svb: {
    label: "SVB — social insurance when you work abroad",
    url: "https://www.svb.nl/",
    authority: "Sociale Verzekeringsbank",
  },
  gemeente: {
    label: "Gemeente Maastricht — registration (BRP)",
    url: "https://www.gemeentemaastricht.nl/",
    authority: "Gemeente Maastricht",
  },
  zorgverzekering: {
    label: "Zorgverzekeringslijn — insurance when working abroad",
    url: "https://www.zorgverzekeringslijn.nl/",
    authority: "Zorgverzekeringslijn",
  },
  krankenkasse: {
    label: "GKV-Spitzenverband — statutory health insurance",
    url: "https://www.gkv-spitzenverband.de/",
    authority: "Gesetzliche Krankenversicherung",
  },
  duo: {
    label: "DUO — student finance and enrolment",
    url: "https://duo.nl/",
    authority: "DUO",
  },
  euraxess: {
    label: "Your Europe — living and working in the EU",
    url: "https://europa.eu/youreurope/",
    authority: "European Commission",
  },
  arbeitsagentur: {
    label: "Bundesagentur für Arbeit — cross-border workers",
    url: "https://www.arbeitsagentur.de/",
    authority: "Bundesagentur für Arbeit",
  },
};

/* ------------------------------- demo profile ------------------------------ */

/** Alex — the persona the demo walks through. */
export const DEMO_PROFILE: UserProfile = {
  id: "demo_alex",
  name: "Alex",
  residenceCountry: "NL",
  residenceCity: "Maastricht",
  isStudent: true,
  studyCountry: "NL",
  studyCity: "Maastricht",
  isEmployed: true,
  workCountry: "DE",
  workCity: "Aachen",
  workHoursPerWeek: 20,
  remoteWorkDaysPerWeek: 0,
  citizenship: "Dutch",
  euCitizen: true,
  healthInsuranceCountry: "NL",
};

/** The same person before the German job — used as the simulator's starting point. */
export const DEMO_PROFILE_BEFORE_JOB: UserProfile = {
  ...DEMO_PROFILE,
  isEmployed: false,
  workCountry: undefined,
  workCity: undefined,
  workHoursPerWeek: undefined,
  remoteWorkDaysPerWeek: undefined,
};

/* --------------------------------- actions -------------------------------- */

export const MOCK_ACTIONS: Action[] = [
  {
    id: "act_health_check",
    title: "Check your health insurance status",
    description:
      "Working in Germany while living in the Netherlands usually moves you to German statutory insurance.",
    category: "HEALTH_INSURANCE",
    completed: false,
    authority: "Zorgverzekeringslijn / Krankenkasse",
    deadline: "2026-10-15",
    impactId: "imp_health",
    why: "You currently hold a Dutch zorgverzekering. If German social insurance applies to your job in Aachen, that Dutch policy may have to end — and paying for one you are no longer entitled to can mean a refund claim later.",
    steps: [
      "Ask your employer in Aachen which Krankenkasse you have been registered with.",
      "Request an S1 form so your German insurance covers you in the Netherlands.",
      "Contact your Dutch insurer before cancelling anything.",
    ],
    documents: ["Employment contract", "Dutch insurance policy number", "BSN"],
    source: SOURCES.zorgverzekering,
  },
  {
    id: "act_social_security",
    title: "Verify your social security situation",
    description:
      "One country at a time collects your contributions. Find out which one that is for you.",
    category: "SOCIAL_SECURITY",
    completed: false,
    authority: "Sociale Verzekeringsbank (SVB)",
    impactId: "imp_social",
    why: "Your pension build-up, unemployment rights and child benefits all follow the country whose social security system you belong to. With a job in Germany and a home in the Netherlands, that is not obvious.",
    steps: [
      "Check with SVB whether German or Dutch social security applies.",
      "If you also work in the Netherlands, ask about an A1 certificate.",
      "Keep the outcome in writing — you will need it at tax time.",
    ],
    documents: ["Employment contract", "Proof of address", "BSN"],
    source: SOURCES.svb,
  },
  {
    id: "act_tax_review",
    title: "Review cross-border tax implications",
    description:
      "Income earned in Germany is generally taxed in Germany, but still reported in the Netherlands.",
    category: "TAX",
    completed: false,
    authority: "Belastingdienst / Finanzamt",
    deadline: "2027-04-30",
    impactId: "imp_tax",
    why: "The Netherlands–Germany tax treaty decides where your salary is taxed. You normally still file a Dutch return declaring worldwide income, with relief for what Germany already took.",
    steps: [
      "Request a German tax number (Steueridentifikationsnummer) via your employer.",
      "Keep every German payslip — you will need the annual Lohnsteuerbescheinigung.",
      "Declare the German income in your Dutch return and claim double-taxation relief.",
    ],
    documents: ["German payslips", "Lohnsteuerbescheinigung", "Dutch DigiD"],
    source: SOURCES.belastingdienst,
  },
  {
    id: "act_tax_number",
    title: "Request a German tax identification number",
    description: "Without a Steuer-ID your employer withholds tax at the highest rate.",
    category: "TAX",
    completed: false,
    authority: "Finanzamt Aachen",
    impactId: "imp_tax",
    why: "Employers must apply the emergency tax class until your Steuer-ID is on file. Sorting it out early avoids months of over-withholding.",
    steps: [
      "Ask HR whether they apply for the number on your behalf.",
      "Otherwise apply directly at Finanzamt Aachen.",
    ],
    documents: ["Passport or ID card", "Employment contract"],
    source: SOURCES.grensinfo,
  },
  {
    id: "act_registration",
    title: "Keep your municipal registration up to date",
    description: "Your BRP record in Maastricht still reflects your situation correctly.",
    category: "REGISTRATION",
    completed: true,
    authority: "Gemeente Maastricht",
    impactId: "imp_registration",
    why: "Almost everything else — insurance, tax, student finance — reads from your municipal registration. It only needs attention when your address changes.",
    steps: ["No action needed while you keep living in Maastricht."],
    source: SOURCES.gemeente,
  },
];

/* --------------------------------- impacts -------------------------------- */

/** The dashboard view of Alex's current cross-border life. */
export const MOCK_IMPACTS: Impact[] = [
  {
    id: "imp_health",
    category: "HEALTH_INSURANCE",
    status: "ACTION",
    title: "Your insurance country is likely to change",
    explanation:
      "You live in the Netherlands but work in Germany. In most cases the country you work in insures you, which means your Dutch policy has to be replaced.",
    actions: MOCK_ACTIONS.filter((a) => a.id === "act_health_check"),
    sources: [SOURCES.zorgverzekering, SOURCES.krankenkasse],
  },
  {
    id: "imp_social",
    category: "SOCIAL_SECURITY",
    status: "CHECK",
    title: "One country collects your contributions",
    explanation:
      "Your job in Aachen probably places you under German social security. Confirm it, because your pension and unemployment rights follow that choice.",
    actions: MOCK_ACTIONS.filter((a) => a.id === "act_social_security"),
    sources: [SOURCES.svb, SOURCES.grensinfo],
  },
  {
    id: "imp_tax",
    category: "TAX",
    status: "ACTION",
    title: "You will deal with two tax authorities",
    explanation:
      "German wages are taxed in Germany, but the Netherlands still wants a return declaring them. The treaty prevents you being taxed twice.",
    actions: MOCK_ACTIONS.filter((a) => a.category === "TAX"),
    sources: [SOURCES.belastingdienst, SOURCES.grensinfo],
  },
  {
    id: "imp_registration",
    category: "REGISTRATION",
    status: "OK",
    title: "Your registration in Maastricht is in order",
    explanation:
      "You are registered at your Maastricht address. Nothing changes here as long as you keep living there.",
    actions: [],
    sources: [SOURCES.gemeente],
  },
  {
    id: "imp_employment",
    category: "EMPLOYMENT",
    status: "OK",
    title: "German employment rules apply to your contract",
    explanation:
      "Your 20 hours a week in Aachen follow German labour law. Your employer applies it — there is nothing for you to arrange.",
    actions: [],
    sources: [SOURCES.arbeitsagentur, SOURCES.grensinfo],
  },
  {
    id: "imp_student",
    category: "STUDENT_STATUS",
    status: "OK",
    title: "Your student status is unaffected",
    explanation:
      "You remain enrolled in Maastricht. Working in Germany does not affect your enrolment, though it can affect student benefits.",
    actions: [],
    sources: [SOURCES.duo],
  },
  {
    id: "imp_residence",
    category: "RESIDENCE",
    status: "OK",
    title: "Your right to live here is secure",
    explanation:
      "As an EU citizen you can live in the Netherlands and work in Germany without a permit.",
    actions: [],
    sources: [SOURCES.euraxess],
  },
];

/* ------------------------------ opportunities ----------------------------- */

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp_arriva_euregio",
    title: "Euregio day ticket for regional trains",
    description:
      "One ticket covering trains and buses across South Limburg, the Aachen region and Belgian Limburg — cheaper than three national fares.",
    category: "TRANSPORT",
    eligibility: "Anyone travelling between Maastricht, Aachen and Liège.",
    source: SOURCES.grensinfo,
    countries: ["NL", "DE", "BE"],
  },
  {
    id: "opp_commuter_deduction",
    title: "German commuter allowance (Pendlerpauschale)",
    description:
      "Germany lets you deduct a fixed amount per kilometre between home and work — including kilometres on the Dutch side.",
    category: "FINANCE",
    eligibility: "You work in Germany and commute from another country.",
    source: SOURCES.grensinfo,
    countries: ["DE"],
  },
  {
    id: "opp_student_travel",
    title: "Student travel product for Dutch students",
    description:
      "Enrolled students in the Netherlands can travel free or at a discount on weekdays or weekends.",
    category: "STUDENT",
    eligibility: "You are enrolled at a Dutch institution and registered with DUO.",
    source: SOURCES.duo,
    countries: ["NL"],
  },
  {
    id: "opp_grensinfopunt",
    title: "Free advice at a GrenzInfoPunkt",
    description:
      "Walk-in consultations in Maastricht, Aachen and Eupen where advisors answer cross-border questions in person, at no cost.",
    category: "SERVICES",
    eligibility: "Anyone living, studying or working across the NL/DE/BE border.",
    source: SOURCES.grensinfo,
    countries: ["NL", "DE", "BE"],
  },
  {
    id: "opp_zorgtoeslag",
    title: "Dutch healthcare allowance (zorgtoeslag)",
    description:
      "A monthly contribution towards your Dutch health insurance premium if your income stays below the threshold.",
    category: "FINANCE",
    eligibility: "You hold a Dutch health insurance policy and earn under the income limit.",
    source: SOURCES.zorgverzekering,
    countries: ["NL"],
  },
  {
    id: "opp_euregio_jobs",
    title: "Cross-border job portals for the Euregio",
    description:
      "Regional job boards listing vacancies on all three sides of the border, including employers used to hiring cross-border staff.",
    category: "WORK",
    eligibility: "Anyone looking for work in the Meuse-Rhine Euregio.",
    source: SOURCES.arbeitsagentur,
    countries: ["NL", "DE", "BE"],
  },
  {
    id: "opp_language_tandem",
    title: "Language tandems and regional student networks",
    description:
      "Student associations across Maastricht, Aachen and Hasselt run free language exchanges and cross-border events.",
    category: "COMMUNITY",
    eligibility: "Students in the Euregio.",
    source: SOURCES.euraxess,
    countries: ["NL", "DE", "BE"],
  },
];

/**
 * Document extraction: schema, instructions, and normalisation.
 *
 * Kept apart from the route handler so the contract is reviewable without
 * touching anything that holds a key, and testable on its own.
 *
 * The schema is `strict`, so the model must return exactly these fields. That
 * guarantees the *shape*, never the *truth* — which is why every value reaches
 * the user through a confirmation step rather than being applied silently.
 */
import type { Country, DocumentAnalysis, UserProfile } from "./types";
import { createId } from "./utils";

export const DOCUMENT_SYSTEM_PROMPT = [
  "You read documents belonging to people who live, study or work across the borders of the Netherlands, Germany and Belgium.",
  "",
  "Extract only what the document visibly states.",
  "- If a field is not stated, return null. Never guess, never infer from what is typical, never fill a gap with a plausible value.",
  "- Report the country the document comes from, not the country the person lives in, as issuingCountry.",
  "- workCountry/workCity is where the person WORKS. residenceCountry/residenceCity is the person's own address, not the employer's.",
  "- Only set a field when you are reading it off this document. A contract that never mentions health insurance must leave healthInsuranceCountry null.",
  "- Do not carry a value across from one field to another. A home address is not a place of study; an employer's address is not where the person lives. If a document says someone is a working student but never names their institution or its city, set isStudent true and leave studyCountry and studyCity null.",
  "",
  "'summary' is two sentences, plain language, addressed to a student or young professional: what this document is, and why it matters for living across a border. No jargon, no legal advice.",
  "",
  "'confidence' is your reading of the document, not your opinion of the person's situation:",
  "- high: the document is clearly legible and states these fields explicitly.",
  "- medium: legible but some fields are inferred from wording rather than stated outright.",
  "- low: hard to read, partially visible, or you are unsure what kind of document this is.",
  "",
  "'missingInfo' lists, in plain language, the things a reader would expect this document to say but which are absent or unreadable. Keep each entry short.",
  "",
  "If the image is not a document at all — a photo of a person, a landscape, a screenshot of something unrelated — set documentType to OTHER, confidence to low, leave every extracted field null, and say plainly in 'summary' that this does not look like a document.",
].join("\n");

const COUNTRY_ENUM = ["NL", "DE", "BE", null];

export const DOCUMENT_ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "documentType",
    "issuingCountry",
    "summary",
    "extracted",
    "detectedChange",
    "deadlines",
    "confidence",
    "missingInfo",
  ],
  properties: {
    documentType: {
      type: "string",
      enum: [
        "EMPLOYMENT_CONTRACT",
        "PAYSLIP",
        "A1_CERTIFICATE",
        "S1_FORM",
        "INSURANCE_PROOF",
        "REGISTRATION_PROOF",
        "ENROLMENT_PROOF",
        "TAX_ASSESSMENT",
        "RESIDENCE_PERMIT",
        "OTHER",
      ],
    },
    issuingCountry: { type: ["string", "null"], enum: COUNTRY_ENUM },
    summary: { type: "string" },
    extracted: {
      type: "object",
      additionalProperties: false,
      required: [
        "isEmployed",
        "workCountry",
        "workCity",
        "workHoursPerWeek",
        "remoteWorkDaysPerWeek",
        "isStudent",
        "studyCountry",
        "studyCity",
        "residenceCountry",
        "residenceCity",
        "healthInsuranceCountry",
      ],
      properties: {
        isEmployed: { type: ["boolean", "null"] },
        workCountry: { type: ["string", "null"], enum: COUNTRY_ENUM },
        workCity: { type: ["string", "null"] },
        workHoursPerWeek: { type: ["number", "null"] },
        remoteWorkDaysPerWeek: { type: ["number", "null"] },
        isStudent: { type: ["boolean", "null"] },
        studyCountry: { type: ["string", "null"], enum: COUNTRY_ENUM },
        studyCity: { type: ["string", "null"] },
        residenceCountry: { type: ["string", "null"], enum: COUNTRY_ENUM },
        residenceCity: { type: ["string", "null"] },
        healthInsuranceCountry: { type: ["string", "null"], enum: COUNTRY_ENUM },
      },
    },
    detectedChange: {
      type: ["string", "null"],
      enum: [
        "NEW_JOB",
        "MOVE",
        "REMOTE_WORK",
        "CHANGE_WORK_HOURS",
        "GRADUATION",
        "START_STUDY",
        "CHANGE_EMPLOYER",
        null,
      ],
    },
    deadlines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "date"],
        properties: {
          label: { type: "string" },
          date: { type: "string", description: "ISO date, YYYY-MM-DD" },
        },
      },
    },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    missingInfo: { type: "array", items: { type: "string" } },
  },
} as const;

/** Raw model output, before nulls are dropped. */
interface RawAnalysis {
  documentType: DocumentAnalysis["documentType"];
  issuingCountry: string | null;
  summary: string;
  extracted: Record<string, string | number | boolean | null>;
  detectedChange: string | null;
  deadlines: Array<{ label: string; date: string }>;
  confidence: DocumentAnalysis["confidence"];
  missingInfo: string[];
}

/**
 * Convert the model's nulls into absent fields.
 *
 * This matters: `{ workCity: null }` spread over a profile would erase a value
 * the user already has, whereas an absent key leaves it alone.
 */
export function normaliseAnalysis(raw: RawAnalysis, fileName?: string): DocumentAnalysis {
  const extracted: Partial<UserProfile> = {};
  for (const [key, value] of Object.entries(raw.extracted ?? {})) {
    if (value === null || value === undefined || value === "") continue;
    (extracted as Record<string, unknown>)[key] = value;
  }

  return {
    id: createId("doc"),
    documentType: raw.documentType,
    issuingCountry: (raw.issuingCountry as Country | null) ?? undefined,
    summary: raw.summary,
    extracted,
    detectedChange: (raw.detectedChange as DocumentAnalysis["detectedChange"]) ?? undefined,
    deadlines: (raw.deadlines ?? []).filter((d) => d.label && d.date),
    confidence: raw.confidence,
    missingInfo: raw.missingInfo ?? [],
    fileName,
  };
}

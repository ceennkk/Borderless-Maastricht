/**
 * Document layer — the third seam, alongside `rules.ts` and `ai.ts`.
 *
 * A document is treated as a *report of a life change*. The analyser reads it
 * into `DocumentAnalysis.extracted`, which is a `Partial<UserProfile>` — the
 * same shape as `LifeChange.patch`. `toLifeChange()` then hands it straight to
 * the existing rule engine, so upload reuses the whole simulate → impacts →
 * actions pipeline rather than duplicating it.
 *
 * Privacy stance, enforced here and in the route handler:
 *   - the file is processed in memory and never written to disk or a database;
 *   - images are re-encoded client-side before upload, which strips EXIF
 *     (phone photos carry GPS coordinates);
 *   - only the resulting analysis is kept, never the document.
 */
import { COUNTRY_META } from "./constants";
import type {
  Country,
  DocumentAnalysis,
  DocumentType,
  LifeChange,
  UserProfile,
} from "./types";
import { createId } from "./utils";

/* -------------------------------- metadata -------------------------------- */

export const DOCUMENT_TYPE_META: Record<DocumentType, { label: string; hint: string }> = {
  EMPLOYMENT_CONTRACT: { label: "Employment contract", hint: "Where you work, how many hours, from when." },
  PAYSLIP: { label: "Payslip", hint: "Which country taxes you and takes contributions." },
  A1_CERTIFICATE: { label: "A1 certificate", hint: "Proof of which social security system applies." },
  S1_FORM: { label: "S1 form", hint: "Extends health cover to your country of residence." },
  INSURANCE_PROOF: { label: "Insurance proof", hint: "Which country insures you." },
  REGISTRATION_PROOF: { label: "Registration proof", hint: "Your official address." },
  ENROLMENT_PROOF: { label: "Enrolment proof", hint: "Your student status." },
  TAX_ASSESSMENT: { label: "Tax assessment", hint: "What a tax office has decided." },
  RESIDENCE_PERMIT: { label: "Residence permit", hint: "What you are allowed to do here." },
  OTHER: { label: "Document", hint: "We will tell you what it appears to be." },
};

export const UPLOAD_LIMITS = {
  /** Applies to the original file the user picks. */
  maxBytes: 10 * 1024 * 1024,
  acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  /** Longest edge after client-side downscaling. Enough for body text. */
  maxEdgePx: 1600,
  /** Cap on the re-encoded payload, mirrored server-side. */
  maxUploadBytes: 6 * 1024 * 1024,
} as const;

export const ACCEPT_ATTRIBUTE = "image/jpeg,image/png,image/webp,image/heic,image/heif";

/* -------------------------------- analyser -------------------------------- */

export interface DocumentAnalyzer {
  readonly id: string;
  analyze(file: File): Promise<DocumentAnalysis>;
}

export class DocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentError";
  }
}

/** Demo analyser — lets the upload UI be built and shown without an API key. */
export const mockDocumentAnalyzer: DocumentAnalyzer = {
  id: "mock",
  async analyze(file) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      id: createId("doc"),
      documentType: "EMPLOYMENT_CONTRACT",
      issuingCountry: "DE",
      summary:
        "This looks like a German employment contract. It sets out where you work, how many hours a week, and from when — the three things that decide most of your cross-border situation. (Demo result: no analyser is connected.)",
      extracted: {
        isEmployed: true,
        workCountry: "DE",
        workCity: "Aachen",
        workHoursPerWeek: 20,
        remoteWorkDaysPerWeek: 2,
      },
      detectedChange: "NEW_JOB",
      deadlines: [{ label: "Employment starts", date: "2026-11-01" }],
      confidence: "medium",
      missingInfo: ["No analyser is connected, so these values are illustrative."],
      fileName: file.name,
      analysedAt: new Date().toISOString(),
    };
  },
};

/** Posts to the route handler, which holds the API key. */
export function createHttpDocumentAnalyzer(endpoint = "/api/documents"): DocumentAnalyzer {
  return {
    id: "http",
    async analyze(file) {
      const imageDataUrl = await prepareImage(file);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, fileName: file.name }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        // No key configured is the one failure worth degrading for, so the
        // upload UI stays demonstrable.
        if (response.status === 503) return mockDocumentAnalyzer.analyze(file);
        throw new DocumentError(detail?.message ?? "We could not read that document.");
      }

      const analysis = (await response.json()) as DocumentAnalysis;
      return { ...analysis, fileName: file.name, analysedAt: new Date().toISOString() };
    },
  };
}

let analyzer: DocumentAnalyzer = createHttpDocumentAnalyzer();

export function getDocumentAnalyzer(): DocumentAnalyzer {
  return analyzer;
}

export function setDocumentAnalyzer(next: DocumentAnalyzer): void {
  analyzer = next;
}

/* ----------------------------- image handling ----------------------------- */

/**
 * Re-encode to a bounded JPEG before upload.
 *
 * Three jobs at once: it strips EXIF (including GPS from phone photos), it caps
 * what leaves the device, and it cuts the token cost of the vision call.
 */
export async function prepareImage(file: File): Promise<string> {
  if (file.size > UPLOAD_LIMITS.maxBytes) {
    throw new DocumentError("That file is larger than 10 MB. Try a photo instead of a scan.");
  }
  if (!UPLOAD_LIMITS.acceptedMimeTypes.includes(file.type as (typeof UPLOAD_LIMITS.acceptedMimeTypes)[number])) {
    throw new DocumentError("Please upload a photo or image of the document (JPEG, PNG or WebP).");
  }

  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, UPLOAD_LIMITS.maxEdgePx / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new DocumentError("Your browser could not process that image.");

  // White backdrop: a transparent PNG would otherwise flatten to black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  if ("close" in bitmap) bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  if (dataUrl.length > UPLOAD_LIMITS.maxUploadBytes) {
    throw new DocumentError("That image is too large to process. Try a tighter crop.");
  }
  return dataUrl;
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* HEIC and some formats fall through to the <img> path */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new DocumentError("That image could not be opened."));
    };
    img.src = url;
  });
}

/* ------------------------- feeding the rule engine ------------------------ */

/**
 * Turn an analysis into a `LifeChange` the rule engine already understands.
 * Returns null when the document says nothing that would change the profile.
 */
export function toLifeChange(analysis: DocumentAnalysis): LifeChange | null {
  const patch = analysis.extracted;
  if (!patch || Object.keys(patch).length === 0) return null;

  return {
    type: analysis.detectedChange ?? inferChangeType(analysis),
    patch,
    effectiveDate: analysis.deadlines[0]?.date,
    notes: analysis.fileName ? `Read from ${analysis.fileName}` : undefined,
  };
}

function inferChangeType(analysis: DocumentAnalysis): LifeChange["type"] {
  const p = analysis.extracted;
  if (p.isEmployed && p.workCountry) return "NEW_JOB";
  if (p.residenceCountry || p.residenceCity) return "MOVE";
  if (p.remoteWorkDaysPerWeek !== undefined) return "REMOTE_WORK";
  if (p.workHoursPerWeek !== undefined) return "CHANGE_WORK_HOURS";
  if (p.isStudent === false) return "GRADUATION";
  if (p.isStudent) return "START_STUDY";
  return "NEW_JOB";
}

/**
 * Human-readable rows for the confirmation step.
 * Extraction is never applied silently — the user checks this list first.
 */
export function describeExtraction(
  patch: Partial<UserProfile>,
): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  const country = (c?: Country) => (c ? COUNTRY_META[c].name : undefined);

  if (patch.isEmployed !== undefined) {
    rows.push({ label: "Employment", value: patch.isEmployed ? "Employed" : "Not employed" });
  }
  if (patch.workCountry || patch.workCity) {
    rows.push({
      label: "Works in",
      value: [patch.workCity, country(patch.workCountry)].filter(Boolean).join(", "),
    });
  }
  if (patch.workHoursPerWeek !== undefined) {
    rows.push({ label: "Hours", value: `${patch.workHoursPerWeek} per week` });
  }
  if (patch.remoteWorkDaysPerWeek !== undefined) {
    rows.push({
      label: "Remote",
      value:
        patch.remoteWorkDaysPerWeek === 0
          ? "Always on site"
          : `${patch.remoteWorkDaysPerWeek} day${patch.remoteWorkDaysPerWeek === 1 ? "" : "s"} per week`,
    });
  }
  if (patch.residenceCountry || patch.residenceCity) {
    rows.push({
      label: "Lives in",
      value: [patch.residenceCity, country(patch.residenceCountry)].filter(Boolean).join(", "),
    });
  }
  if (patch.isStudent !== undefined) {
    rows.push({ label: "Student", value: patch.isStudent ? "Yes" : "No" });
  }
  if (patch.studyCountry || patch.studyCity) {
    rows.push({
      label: "Studies in",
      value: [patch.studyCity, country(patch.studyCountry)].filter(Boolean).join(", "),
    });
  }
  if (patch.healthInsuranceCountry) {
    rows.push({ label: "Insured in", value: country(patch.healthInsuranceCountry)! });
  }
  return rows;
}

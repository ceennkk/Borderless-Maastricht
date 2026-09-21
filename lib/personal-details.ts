/**
 * The user's own identifying details, and how they get into a draft.
 *
 * THE IMPORTANT PART: these values never leave the device and are never sent to
 * the model. The agent writes letters containing placeholders — `[BSN]`,
 * `[Geburtsdatum]` — and the substitution happens *here*, in the browser, after
 * the answer comes back.
 *
 * That is not a compromise, it is the better design. A BSN, a Steuer-ID and a
 * date of birth are exactly the data you do not hand to a third-party API to
 * have it typed back to you, and the model writes a better letter without them
 * anyway.
 */
import type { MessageDraft } from "./types";

export interface PersonalDetails {
  fullName?: string;
  /** ISO date, formatted per letter language on substitution. */
  dateOfBirth?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  /** Dutch citizen service number. */
  bsn?: string;
  /** German tax identification number. */
  steuerId?: string;
  insuranceNumber?: string;
  phone?: string;
  email?: string;
  employerName?: string;
}

export const PERSONAL_DETAIL_FIELDS: Array<{
  key: keyof PersonalDetails;
  label: string;
  hint?: string;
  type?: "text" | "date" | "email" | "tel";
}> = [
  { key: "fullName", label: "Full name", hint: "As it appears on your ID" },
  { key: "dateOfBirth", label: "Date of birth", type: "date" },
  { key: "street", label: "Street and number" },
  { key: "postalCode", label: "Postcode" },
  { key: "city", label: "City" },
  { key: "bsn", label: "BSN", hint: "Dutch citizen service number" },
  { key: "steuerId", label: "Steuer-ID", hint: "German tax identification number" },
  { key: "insuranceNumber", label: "Insurance number" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "employerName", label: "Employer" },
];

/**
 * Placeholder spellings we recognise, per field.
 *
 * The agent writes in the authority's language, so the same field arrives as
 * `[Geburtsdatum]`, `[geboortedatum]` or `[date of birth]`. Matching is done on
 * a normalised form (lowercased, letters only) so punctuation and spacing do
 * not matter.
 */
const ALIASES: Record<keyof PersonalDetails, string[]> = {
  fullName: [
    "name", "ihrname", "irname", "vorundnachname", "vollername", "vollstandigername",
    "uwnaam", "naam", "voornaamenachternaam", "fullname", "yourname", "nomcomplet",
  ],
  dateOfBirth: ["geburtsdatum", "gebdatum", "geboortedatum", "dateofbirth", "datedenaissance"],
  street: ["strasse", "strasseundhausnummer", "straat", "straatennummer", "street", "streetandnumber"],
  postalCode: ["plz", "postleitzahl", "postcode", "postcodenl", "zipcode"],
  city: ["ort", "wohnort", "stadt", "plaats", "woonplaats", "city"],
  bsn: ["bsn", "bsnnummer", "burgerservicenummer", "sofinummer"],
  steuerId: [
    "steuerid", "steueridentifikationsnummer", "steueridnr", "steuernummer",
    "taxid", "taxidentificationnumber",
  ],
  insuranceNumber: [
    "versicherungsnummer", "versichertennummer", "krankenversicherungsnummer",
    "polisnummer", "verzekeringsnummer", "insurancenumber",
  ],
  phone: ["telefon", "telefonnummer", "telefoonnummer", "phone", "phonenumber", "tel"],
  email: ["email", "emailadresse", "emailadres", "mail", "emailaddress"],
  employerName: [
    "arbeitgeber", "namedesarbeitgebers", "werkgever", "naamwerkgever",
    "employer", "employername",
  ],
};

/** Composite placeholders built from several fields. */
const COMPOSITES: Record<string, (d: PersonalDetails) => string | undefined> = {
  address: (d) => formatAddress(d),
  adresse: (d) => formatAddress(d),
  adres: (d) => formatAddress(d),
  anschrift: (d) => formatAddress(d),
  wohnadresse: (d) => formatAddress(d),
  woonadres: (d) => formatAddress(d),
};

function normalise(token: string): string {
  return token.toLowerCase().replace(/[^a-z]/g, "");
}

function formatAddress(d: PersonalDetails): string | undefined {
  const parts = [d.street, [d.postalCode, d.city].filter(Boolean).join(" ")].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

/** Date in the local convention: 17.04.2001 in Germany, 17-04-2001 in NL/FR. */
export function formatDate(iso: string, language: MessageDraft["language"]): string {
  const [y, m, day] = iso.split("-");
  if (!y || !m || !day) return iso;
  // German uses dots, Dutch and French use hyphens; English gets the ISO form.
  if (language === "de") return `${day}.${m}.${y}`;
  if (language === "nl" || language === "fr") return `${day}-${m}-${y}`;
  return iso;
}

function valueFor(
  token: string,
  details: PersonalDetails,
  language: MessageDraft["language"],
): string | undefined {
  const key = normalise(token);

  const composite = COMPOSITES[key];
  if (composite) return composite(details);

  for (const [field, aliases] of Object.entries(ALIASES) as Array<
    [keyof PersonalDetails, string[]]
  >) {
    if (!aliases.includes(key)) continue;
    const raw = details[field];
    if (!raw) return undefined;
    return field === "dateOfBirth" ? formatDate(raw, language) : raw;
  }
  return undefined;
}

export interface FilledDraft extends MessageDraft {
  /** Placeholders we replaced, as they appeared in the text. */
  filled: string[];
  /** Placeholders still in the text — the user must complete these by hand. */
  missing: string[];
}

/**
 * Substitute what we know into a draft. Runs entirely in the browser.
 * Anything we have no value for is left as a visible placeholder.
 */
export function fillDraft(draft: MessageDraft, details: PersonalDetails): FilledDraft {
  const filled = new Set<string>();
  const missing = new Set<string>();

  const substitute = (text: string) =>
    text.replace(/\[([^\]\n]{1,60})\]/g, (whole, token: string) => {
      const value = valueFor(token, details, draft.language);
      if (value) {
        filled.add(token.trim());
        return value;
      }
      missing.add(token.trim());
      return whole;
    });

  return {
    ...draft,
    subject: substitute(draft.subject),
    body: substitute(draft.body),
    filled: Array.from(filled),
    missing: Array.from(missing),
  };
}

/** How complete the stored details are, for the profile page. */
export function detailsProgress(details: PersonalDetails): { filled: number; total: number } {
  const total = PERSONAL_DETAIL_FIELDS.length;
  const filled = PERSONAL_DETAIL_FIELDS.filter((f) => {
    const value = details[f.key];
    return typeof value === "string" && value.trim().length > 0;
  }).length;
  return { filled, total };
}

/** A stored detail rendered the way the target country writes it. */
export function displayValue(
  key: keyof PersonalDetails,
  details: PersonalDetails,
  language: MessageDraft["language"],
): string | undefined {
  const raw = details[key];
  if (!raw) return undefined;
  return key === "dateOfBirth" ? formatDate(raw, language) : raw;
}

/**
 * Authority registry — the planner's ground truth.
 *
 * The scheduling agent may NOT invent lead times, channels or contact details.
 * It looks them up here through tools. This is the same lesson the Ask prompt
 * taught us: a model asked for a number will produce one, and a wrong wait time
 * or a wrong address sends someone to the wrong counter.
 *
 * ⚠ Demo content. The URLs are real entry points, but lead times are indicative
 * and the registry is incomplete. Before this is used for real, every row needs
 * checking against the authority itself — that is Developer 3's knowledge-base
 * task, not something to paper over with a better prompt.
 *
 * `services[].serviceName` and `navigationHint` are the most perishable part:
 * portals rename and reorganise their service lists. They are written as
 * navigation hints rather than deep links for exactly that reason, and the UI
 * tells the user to check the name on the portal itself.
 */
import type { Authority, ContactChannel, Country, ImpactCategory } from "./types";

export const AUTHORITIES: Authority[] = [
  {
    id: "svb",
    name: "Sociale Verzekeringsbank (SVB)",
    country: "NL",
    handles:
      "Decides which country's social security applies to you, and issues the A1 certificate for cross-border work.",
    categories: ["SOCIAL_SECURITY"],
    channels: ["ONLINE", "POST", "PHONE"],
    appointmentRequired: false,
    typicalLeadTimeDays: [14, 42],
    infoUrl: "https://www.svb.nl/",
    language: "nl",
  },
  {
    id: "belastingdienst",
    name: "Belastingdienst",
    country: "NL",
    handles: "Dutch income tax, including returns that declare foreign income.",
    categories: ["TAX"],
    channels: ["ONLINE", "PHONE"],
    appointmentRequired: false,
    typicalLeadTimeDays: [7, 21],
    infoUrl: "https://www.belastingdienst.nl/",
    language: "nl",
  },
  {
    id: "finanzamt_aachen",
    name: "Finanzamt Aachen-Stadt",
    country: "DE",
    city: "Aachen",
    handles:
      "German income tax and the tax identification number (Steuer-Identifikationsnummer) you need before your first payslip.",
    categories: ["TAX"],
    channels: ["IN_PERSON", "POST", "ONLINE"],
    appointmentRequired: true,
    typicalLeadTimeDays: [10, 30],
    bookingUrl: "https://www.finanzamt.nrw.de/",
    infoUrl: "https://www.finanzamt.nrw.de/",
    language: "de",
    services: [
      {
        id: "steuer_id",
        serviceName: "Steuerliche Erfassung / Steuer-Identifikationsnummer",
        purpose:
          "Getting the tax identification number your German employer needs. Without it you are taxed in the emergency bracket and pay far more than you owe until it is sorted.",
        url: "https://www.finanzamt.nrw.de/",
        navigationHint: "Finanzamt Aachen-Stadt → Kontakt / Terminvereinbarung",
        documents: [
          "Valid passport or ID card",
          "Employment contract",
          "Proof of your address (also valid if you live abroad)",
        ],
        formFields: [
          { label: "Name", detailKey: "fullName" },
          { label: "Geburtsdatum", detailKey: "dateOfBirth" },
          { label: "Anschrift", detailKey: "street" },
          { label: "Arbeitgeber", detailKey: "employerName" },
          { label: "E-Mail", detailKey: "email" },
        ],
        fee: "Free",
        notes:
          "Many employers apply for this on your behalf. Ask HR before booking a slot — it may already be running.",
      },
    ],
  },
  {
    id: "gemeente_maastricht",
    name: "Gemeente Maastricht",
    country: "NL",
    city: "Maastricht",
    handles: "Municipal registration (BRP), your official address and your BSN.",
    categories: ["REGISTRATION"],
    channels: ["IN_PERSON", "ONLINE"],
    appointmentRequired: true,
    typicalLeadTimeDays: [7, 21],
    bookingUrl: "https://www.gemeentemaastricht.nl/afspraak",
    infoUrl: "https://www.gemeentemaastricht.nl/",
    language: "nl",
    services: [
      {
        id: "inschrijving",
        serviceName: "Inschrijving vanuit het buitenland (eerste inschrijving)",
        purpose:
          "Registering in the Netherlands for the first time. This is where your BSN comes from, so almost everything else waits on it.",
        url: "https://www.gemeentemaastricht.nl/afspraak",
        navigationHint: "Afspraak maken → Burgerzaken → Inschrijving",
        documents: [
          "Valid passport or ID card",
          "Rental contract or proof of address",
          "Birth certificate (often required, sometimes legalised)",
        ],
        formFields: [
          { label: "Naam", detailKey: "fullName" },
          { label: "Geboortedatum", detailKey: "dateOfBirth" },
          { label: "Adres in Maastricht", detailKey: "street" },
          { label: "E-mail", detailKey: "email" },
          { label: "Telefoon", detailKey: "phone" },
        ],
      },
      {
        id: "verhuizing",
        serviceName: "Verhuizing doorgeven",
        purpose: "Telling the municipality you have moved to a new address within the Netherlands.",
        url: "https://www.gemeentemaastricht.nl/afspraak",
        navigationHint: "Afspraak maken → Burgerzaken → Verhuizing",
        documents: ["DigiD", "Proof of the new address"],
        formFields: [
          { label: "BSN", detailKey: "bsn" },
          { label: "Naam", detailKey: "fullName" },
          { label: "Nieuw adres", detailKey: "street" },
        ],
        notes: "Often possible entirely online with DigiD — check before booking a slot.",
      },
    ],
  },
  {
    id: "krankenkasse",
    name: "German statutory health insurer (Krankenkasse)",
    country: "DE",
    handles:
      "Statutory health insurance for people working in Germany, and the S1 form that extends cover to your country of residence.",
    categories: ["HEALTH_INSURANCE"],
    channels: ["ONLINE", "EMAIL", "PHONE"],
    appointmentRequired: false,
    typicalLeadTimeDays: [3, 14],
    infoUrl: "https://www.gkv-spitzenverband.de/",
    language: "de",
  },
  {
    id: "zorgverzekeraar",
    name: "Your Dutch health insurer (zorgverzekeraar)",
    country: "NL",
    handles: "Your existing Dutch policy — including ending it correctly if another country takes over.",
    categories: ["HEALTH_INSURANCE"],
    channels: ["ONLINE", "EMAIL", "PHONE"],
    appointmentRequired: false,
    typicalLeadTimeDays: [3, 10],
    infoUrl: "https://www.zorgverzekeringslijn.nl/",
    language: "nl",
  },
  {
    id: "buergeramt_aachen",
    name: "Bürgeramt Aachen",
    country: "DE",
    city: "Aachen",
    handles:
      "Registering and deregistering a German address, and the Meldebescheinigung that proves it.",
    categories: ["REGISTRATION"],
    channels: ["IN_PERSON", "ONLINE"],
    appointmentRequired: true,
    typicalLeadTimeDays: [7, 28],
    bookingUrl: "https://www.aachen.de/",
    infoUrl: "https://www.aachen.de/",
    language: "de",
    services: [
      {
        id: "anmeldung",
        serviceName: "Anmeldung einer Wohnung",
        purpose:
          "Registering a German address. Required within two weeks of moving in, and needed before a Steuer-ID and most other German paperwork.",
        url: "https://www.aachen.de/",
        navigationHint: "Bürgerservice → Terminvereinbarung → Einwohnerangelegenheiten",
        documents: [
          "Valid passport or ID card",
          "Wohnungsgeberbestätigung (signed by your landlord)",
          "Completed Meldeformular",
        ],
        formFields: [
          { label: "Name", detailKey: "fullName" },
          { label: "Geburtsdatum", detailKey: "dateOfBirth" },
          { label: "Neue Anschrift", detailKey: "street" },
          { label: "E-Mail", detailKey: "email" },
          { label: "Telefon", detailKey: "phone" },
        ],
        fee: "Usually free",
      },
      {
        id: "abmeldung",
        serviceName: "Abmeldung einer Wohnung",
        purpose:
          "Deregistering a German address when you move abroad or give up your German residence. Only relevant if you are currently registered in Aachen.",
        url: "https://www.aachen.de/",
        navigationHint: "Bürgerservice → Terminvereinbarung → Einwohnerangelegenheiten",
        documents: ["Valid passport or ID card", "Completed Abmeldeformular"],
        formFields: [
          { label: "Name", detailKey: "fullName" },
          { label: "Geburtsdatum", detailKey: "dateOfBirth" },
          { label: "Bisherige Anschrift", detailKey: "street" },
          { label: "Neue Anschrift im Ausland", detailKey: "city" },
          { label: "E-Mail", detailKey: "email" },
        ],
        fee: "Usually free",
        notes:
          "Deregistration only applies if you are registered in Germany. Living in Maastricht and commuting to Aachen normally means you never were.",
      },
    ],
  },
  {
    id: "grensinfopunt",
    name: "GrenzInfoPunkt / Grensinfopunt",
    country: "NL",
    city: "Maastricht",
    handles:
      "Free in-person advice on cross-border work, tax and insurance. The right place when your case does not fit the standard answers.",
    categories: ["SOCIAL_SECURITY", "TAX", "HEALTH_INSURANCE", "EMPLOYMENT"],
    channels: ["IN_PERSON", "EMAIL", "PHONE"],
    appointmentRequired: true,
    typicalLeadTimeDays: [7, 21],
    bookingUrl: "https://www.grenzinfo.eu/",
    infoUrl: "https://www.grenzinfo.eu/",
    language: "nl",
  },
  {
    id: "duo",
    name: "DUO",
    country: "NL",
    handles: "Student enrolment records, student finance and the student travel product.",
    categories: ["STUDENT_STATUS"],
    channels: ["ONLINE", "PHONE"],
    appointmentRequired: false,
    typicalLeadTimeDays: [5, 15],
    infoUrl: "https://duo.nl/",
    language: "nl",
  },
  {
    id: "ind",
    name: "IND (Immigratie- en Naturalisatiedienst)",
    country: "NL",
    handles: "Residence permits and their conditions for non-EU citizens.",
    categories: ["RESIDENCE"],
    channels: ["IN_PERSON", "ONLINE", "PHONE"],
    appointmentRequired: true,
    typicalLeadTimeDays: [14, 60],
    bookingUrl: "https://ind.nl/",
    infoUrl: "https://ind.nl/",
    language: "nl",
  },
];

/**
 * Best-effort authority for a task, when the planner did not name one.
 *
 * The agent sets `authorityId` most of the time but not always, and a missing
 * id silently costs the user the booking preparation. Resolving it from the
 * task itself is deterministic, so the feature no longer depends on the model
 * remembering a field.
 */
export function findAuthorityFor(input: {
  authority?: string;
  category?: ImpactCategory;
  country?: Country;
}): Authority | undefined {
  const name = input.authority?.toLowerCase() ?? "";

  if (name) {
    // A name match is strongest: "Finanzamt Aachen-Stadt" → finanzamt_aachen.
    const byName = AUTHORITIES.find((a) => {
      const words = a.name.toLowerCase().split(/[^a-zà-ÿ]+/).filter((w) => w.length > 4);
      return words.some((w) => name.includes(w));
    });
    if (byName) return byName;
  }

  if (!input.category) return undefined;

  const candidates = AUTHORITIES.filter((a) => a.categories.includes(input.category!));
  if (candidates.length === 0) return undefined;

  // Prefer one in the country the task concerns, then one that can be booked.
  return (
    candidates.find((a) => input.country && a.country === input.country && a.services?.length) ??
    candidates.find((a) => a.services?.length) ??
    candidates.find((a) => input.country && a.country === input.country) ??
    candidates[0]
  );
}

export function getBookingService(authorityId?: string, serviceId?: string) {
  const authority = authorityId ? getAuthority(authorityId) : undefined;
  if (!authority?.services?.length) return undefined;
  return serviceId
    ? authority.services.find((s) => s.id === serviceId)
    : authority.services[0];
}

export function getAuthority(id: string): Authority | undefined {
  return AUTHORITIES.find((a) => a.id === id);
}

/** Compact view the agent reads through its tools. */
export function authoritySummaries() {
  return AUTHORITIES.map((a) => ({
    id: a.id,
    name: a.name,
    country: a.country,
    city: a.city,
    handles: a.handles,
    categories: a.categories,
    channels: a.channels,
    appointmentRequired: a.appointmentRequired,
    typicalLeadTimeDays: a.typicalLeadTimeDays,
    language: a.language,
  }));
}

export const CHANNEL_META: Record<ContactChannel, { label: string; hint: string }> = {
  ONLINE: { label: "Online", hint: "Can be done from home" },
  IN_PERSON: { label: "In person", hint: "You have to go there" },
  POST: { label: "By post", hint: "Paper form" },
  PHONE: { label: "By phone", hint: "Call them" },
  EMAIL: { label: "By email", hint: "Write to them" },
};

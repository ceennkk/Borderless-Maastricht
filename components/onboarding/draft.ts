/**
 * The shape onboarding collects, and how it becomes a UserProfile.
 *
 * A draft is deliberately looser than UserProfile — fields are unset until the
 * user answers — so the wizard never has to fake values mid-flow.
 */
import { createId } from "@/lib/utils";
import type { Country, RegistrationStatus, UserProfile } from "@/lib/types";

export interface ProfileDraft {
  name: string;
  residenceCountry?: Country;
  residenceCity: string;
  registrationStatus?: RegistrationStatus;
  isStudent?: boolean;
  studyCountry?: Country;
  studyCity: string;
  isEmployed?: boolean;
  workCountry?: Country;
  workCity: string;
  workHoursPerWeek?: number;
  remoteWorkDaysPerWeek?: number;
  citizenship: string;
  euCitizen?: boolean;
  healthInsuranceCountry?: Country;
}

export const EMPTY_DRAFT: ProfileDraft = {
  name: "",
  residenceCity: "",
  studyCity: "",
  workCity: "",
  citizenship: "",
};

/** Convert a completed draft into the shared UserProfile shape. */
export function draftToProfile(draft: ProfileDraft): UserProfile {
  return {
    id: createId("user"),
    name: draft.name.trim() || "You",
    residenceCountry: draft.residenceCountry ?? "NL",
    residenceCity: draft.residenceCity.trim(),
    registrationStatus: draft.registrationStatus,
    isStudent: draft.isStudent ?? false,
    studyCountry: draft.isStudent ? draft.studyCountry : undefined,
    studyCity: draft.isStudent ? draft.studyCity.trim() : undefined,
    isEmployed: draft.isEmployed ?? false,
    workCountry: draft.isEmployed ? draft.workCountry : undefined,
    workCity: draft.isEmployed ? draft.workCity.trim() : undefined,
    workHoursPerWeek: draft.isEmployed ? draft.workHoursPerWeek : undefined,
    remoteWorkDaysPerWeek: draft.isEmployed ? (draft.remoteWorkDaysPerWeek ?? 0) : undefined,
    citizenship: draft.citizenship.trim() || "Unspecified",
    euCitizen: draft.euCitizen ?? true,
    healthInsuranceCountry: draft.healthInsuranceCountry,
  };
}

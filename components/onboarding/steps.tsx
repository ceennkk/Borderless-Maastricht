"use client";

/**
 * Step registry for the onboarding wizard.
 *
 * Each step declares its own question, its own body, and whether it can be
 * completed. The wizard knows nothing about the questions themselves, so adding
 * or reordering a step is a change in this file only.
 */
import type { ProfileDraft } from "./draft";
import { ChoiceGroup, CityField, CountryPicker } from "./fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES, COUNTRY_META, REGISTRATION_STATUS_META } from "@/lib/constants";
import type { Country, RegistrationStatus } from "@/lib/types";

/** What the thing is actually called in each country — the fastest way to be sure. */
const HEALTH_INSURANCE_TERM: Record<string, string> = {
  NL: "zorgverzekering",
  DE: "Krankenkasse",
  BE: "ziekenfonds / mutualité",
};

export interface StepProps {
  draft: ProfileDraft;
  update: (patch: Partial<ProfileDraft>) => void;
}

export interface OnboardingStep {
  id: string;
  question: string;
  description?: string;
  Body: (props: StepProps) => React.ReactNode;
  /** Whether the user may continue. */
  isComplete: (draft: ProfileDraft) => boolean;
  /** Skip the step entirely when it does not apply. */
  isRelevant?: (draft: ProfileDraft) => boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "residence",
    question: "Where do you live?",
    description: "The country you are officially registered in. Everything else follows from this.",
    isComplete: (d) =>
      Boolean(d.residenceCountry && d.residenceCity.trim() && d.registrationStatus),
    Body: ({ draft, update }) => {
      const city = draft.residenceCity.trim();
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your first name</Label>
            <Input
              id="name"
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Alex"
            />
          </div>
          <CountryPicker
            label="Country of residence"
            value={draft.residenceCountry}
            onChange={(residenceCountry) => update({ residenceCountry })}
          />
          <CityField
            value={draft.residenceCity}
            country={draft.residenceCountry}
            onChange={(residenceCity) => update({ residenceCity })}
          />
          {city && (
            <ChoiceGroup<RegistrationStatus>
              columns={3}
              label={`Are you registered in ${city}?`}
              value={draft.registrationStatus}
              onChange={(registrationStatus) => update({ registrationStatus })}
              options={[
                { value: "registered", label: REGISTRATION_STATUS_META.registered.label },
                { value: "not_registered", label: REGISTRATION_STATUS_META.not_registered.label },
                { value: "in_progress", label: REGISTRATION_STATUS_META.in_progress.label },
              ]}
            />
          )}
        </div>
      );
    },
  },
  {
    id: "study",
    question: "Do you study? Where?",
    description: "Enrolment affects benefits, insurance and sometimes tax.",
    isComplete: (d) => d.isStudent === false || Boolean(d.studyCountry && d.studyCity.trim()),
    Body: ({ draft, update }) => (
      <div className="space-y-6">
        <ChoiceGroup
          label="Are you a student?"
          value={draft.isStudent}
          onChange={(isStudent) => update({ isStudent })}
          options={[
            { value: true, label: "Yes, I study" },
            { value: false, label: "No" },
          ]}
        />
        {draft.isStudent && (
          <>
            <CountryPicker
              label="Country of study"
              value={draft.studyCountry}
              onChange={(studyCountry) => update({ studyCountry })}
            />
            <CityField
              value={draft.studyCity}
              country={draft.studyCountry}
              onChange={(studyCity) => update({ studyCity })}
            />
          </>
        )}
      </div>
    ),
  },
  {
    id: "work",
    question: "Do you work? Where?",
    description: "Working across a border is what changes the most.",
    isComplete: (d) => d.isEmployed === false || Boolean(d.workCountry && d.workCity.trim()),
    Body: ({ draft, update }) => (
      <div className="space-y-6">
        <ChoiceGroup
          label="Do you have a job?"
          value={draft.isEmployed}
          onChange={(isEmployed) => update({ isEmployed })}
          options={[
            { value: true, label: "Yes, I work" },
            { value: false, label: "Not right now" },
          ]}
        />
        {draft.isEmployed && (
          <>
            <CountryPicker
              label="Country of work"
              value={draft.workCountry}
              onChange={(workCountry) => update({ workCountry })}
            />
            <CityField
              value={draft.workCity}
              country={draft.workCountry}
              onChange={(workCity) => update({ workCity })}
            />
          </>
        )}
      </div>
    ),
  },
  {
    id: "hours",
    question: "How many hours per week?",
    description: "Thresholds in each country depend on this more than people expect.",
    isRelevant: (d) => d.isEmployed === true,
    isComplete: (d) => typeof d.workHoursPerWeek === "number",
    Body: ({ draft, update }) => (
      <ChoiceGroup
        columns={4}
        value={draft.workHoursPerWeek}
        onChange={(workHoursPerWeek) => update({ workHoursPerWeek })}
        options={[
          { value: 8, label: "Up to 8h", hint: "Small side job" },
          { value: 16, label: "16h", hint: "Part-time" },
          { value: 20, label: "20h", hint: "Half-time" },
          { value: 40, label: "36–40h", hint: "Full-time" },
        ]}
      />
    ),
  },
  {
    id: "remote",
    question: "Do you work remotely?",
    description: "Days worked from home can move your social security to another country.",
    isRelevant: (d) => d.isEmployed === true,
    isComplete: (d) => typeof d.remoteWorkDaysPerWeek === "number",
    Body: ({ draft, update }) => (
      <ChoiceGroup
        columns={4}
        value={draft.remoteWorkDaysPerWeek}
        onChange={(remoteWorkDaysPerWeek) => update({ remoteWorkDaysPerWeek })}
        options={[
          { value: 0, label: "Never", hint: "Always on site" },
          { value: 1, label: "1 day" },
          { value: 2, label: "2 days" },
          { value: 3, label: "3+ days", hint: "Mostly from home" },
        ]}
      />
    ),
  },
  {
    id: "citizenship",
    question: "What is your citizenship?",
    description: "EU citizenship removes most residence and work-permit questions.",
    isComplete: (d) => Boolean(d.citizenship.trim()) && typeof d.euCitizen === "boolean",
    Body: ({ draft, update }) => (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="citizenship">Citizenship</Label>
          <Input
            id="citizenship"
            value={draft.citizenship}
            onChange={(e) => update({ citizenship: e.target.value })}
            placeholder="e.g. Dutch, German, Turkish"
          />
        </div>
        <ChoiceGroup
          label="Are you an EU/EEA citizen?"
          value={draft.euCitizen}
          onChange={(euCitizen) => update({ euCitizen })}
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No", hint: "A residence permit sets the rules" },
          ]}
        />
      </div>
    ),
  },
  {
    id: "insurance",
    question: "Which country is your health insurance in?",
    description:
      "Health insurance only — the one that pays for a doctor or hospital. Not liability, car, contents or travel insurance.",
    // "I don't know" is a real answer here. Forcing a guess would put a fact in
    // the profile that nobody checked, and the rule engine would trust it.
    isComplete: (d) => Boolean(d.healthInsuranceCountry) || d.healthInsuranceUnknown === true,
    Body: ({ draft, update }) => (
      <div className="space-y-4">
        <ChoiceGroup
          columns={2}
          value={draft.healthInsuranceUnknown ? "UNKNOWN" : draft.healthInsuranceCountry}
          onChange={(value) =>
            value === "UNKNOWN"
              ? update({ healthInsuranceUnknown: true, healthInsuranceCountry: undefined })
              : update({ healthInsuranceUnknown: false, healthInsuranceCountry: value as Country })
          }
          options={[
            ...COUNTRIES.map((c) => ({
              value: c as string,
              label: COUNTRY_META[c].name,
              hint: HEALTH_INSURANCE_TERM[c],
            })),
            {
              value: "UNKNOWN",
              label: "I am not sure",
              hint: "We will make finding out one of your tasks",
            },
          ]}
        />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Look for the card you show at a doctor&apos;s surgery, or the company that takes a monthly
          premium from your account.
        </p>
      </div>
    ),
  },
];

"use client";

/**
 * Inline-editable version of the profile.
 *
 * Every change is persisted immediately through the storage layer — no save
 * button needed. Section headings mirror the onboarding flow so users can
 * find each field by memory.
 */
import { ChoiceGroup, CityField, CountryPicker } from "@/components/onboarding/fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";
import { COUNTRIES, COUNTRY_META, REGISTRATION_STATUS_META } from "@/lib/constants";
import type { Country, RegistrationStatus, UserProfile } from "@/lib/types";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-border pb-2 text-xs font-semibold text-muted-foreground">
      {children}
    </h3>
  );
}

export function ProfileEditForm() {
  const { profile, setProfile } = useProfile();

  function patch(changes: Partial<UserProfile>) {
    setProfile({ ...profile, ...changes });
  }

  const healthValue = profile.healthInsuranceCountry ?? "UNKNOWN";

  return (
    <div className="space-y-8">
      {/* ── Personal ──────────────────────────────────────────── */}
      <SectionHeading>Personal</SectionHeading>

      <div className="space-y-2">
        <Label htmlFor="edit-name">First name</Label>
        <Input
          id="edit-name"
          defaultValue={profile.name === "You" ? "" : profile.name}
          placeholder="Alex"
          onBlur={(e) => patch({ name: e.target.value.trim() || "You" })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-citizenship">Citizenship</Label>
        <Input
          id="edit-citizenship"
          defaultValue={profile.citizenship === "Unspecified" ? "" : profile.citizenship}
          placeholder="e.g. Dutch, German, Turkish"
          onBlur={(e) => patch({ citizenship: e.target.value.trim() || "Unspecified" })}
        />
      </div>

      <ChoiceGroup
        label="EU/EEA citizen?"
        value={profile.euCitizen}
        onChange={(euCitizen) => patch({ euCitizen })}
        options={[
          { value: true, label: "Yes" },
          { value: false, label: "No", hint: "Residence permit sets the rules" },
        ]}
      />

      {/* ── Residence ─────────────────────────────────────────── */}
      <SectionHeading>Where you live</SectionHeading>

      <CountryPicker
        label="Country of residence"
        value={profile.residenceCountry}
        onChange={(residenceCountry) => patch({ residenceCountry })}
      />
      <CityField
        label="City of residence"
        value={profile.residenceCity}
        country={profile.residenceCountry}
        onChange={(residenceCity) => patch({ residenceCity })}
      />
      {profile.residenceCity.trim() && (
        <ChoiceGroup<RegistrationStatus>
          columns={3}
          label={`Registered in ${profile.residenceCity}?`}
          value={profile.registrationStatus}
          onChange={(registrationStatus) => patch({ registrationStatus })}
          options={[
            { value: "registered", label: REGISTRATION_STATUS_META.registered.label },
            { value: "not_registered", label: REGISTRATION_STATUS_META.not_registered.label },
            { value: "in_progress", label: REGISTRATION_STATUS_META.in_progress.label },
          ]}
        />
      )}

      {/* ── Study ─────────────────────────────────────────────── */}
      <SectionHeading>Study</SectionHeading>

      <ChoiceGroup
        label="Are you a student?"
        value={profile.isStudent}
        onChange={(isStudent) =>
          patch(
            isStudent
              ? { isStudent }
              : { isStudent, studyCountry: undefined, studyCity: undefined },
          )
        }
        options={[
          { value: true, label: "Yes, I study" },
          { value: false, label: "No" },
        ]}
      />
      {profile.isStudent && (
        <>
          <CountryPicker
            label="Country of study"
            value={profile.studyCountry}
            onChange={(studyCountry) => patch({ studyCountry })}
          />
          <CityField
            label="City of study"
            value={profile.studyCity ?? ""}
            country={profile.studyCountry}
            onChange={(studyCity) => patch({ studyCity })}
          />
        </>
      )}

      {/* ── Work ──────────────────────────────────────────────── */}
      <SectionHeading>Work</SectionHeading>

      <ChoiceGroup
        label="Do you have a job?"
        value={profile.isEmployed}
        onChange={(isEmployed) =>
          patch(
            isEmployed
              ? { isEmployed }
              : {
                  isEmployed,
                  workCountry: undefined,
                  workCity: undefined,
                  workHoursPerWeek: undefined,
                  remoteWorkDaysPerWeek: undefined,
                },
          )
        }
        options={[
          { value: true, label: "Yes, I work" },
          { value: false, label: "Not right now" },
        ]}
      />
      {profile.isEmployed && (
        <>
          <CountryPicker
            label="Country of work"
            value={profile.workCountry}
            onChange={(workCountry) => patch({ workCountry })}
          />
          <CityField
            label="City of work"
            value={profile.workCity ?? ""}
            country={profile.workCountry}
            onChange={(workCity) => patch({ workCity })}
          />
          <ChoiceGroup
            columns={4}
            label="Hours per week"
            value={profile.workHoursPerWeek}
            onChange={(workHoursPerWeek) => patch({ workHoursPerWeek })}
            options={[
              { value: 8, label: "Up to 8h", hint: "Small side job" },
              { value: 16, label: "16h", hint: "Part-time" },
              { value: 20, label: "20h", hint: "Half-time" },
              { value: 40, label: "36–40h", hint: "Full-time" },
            ]}
          />
          <ChoiceGroup
            columns={4}
            label="Remote work days per week"
            value={profile.remoteWorkDaysPerWeek}
            onChange={(remoteWorkDaysPerWeek) => patch({ remoteWorkDaysPerWeek })}
            options={[
              { value: 0, label: "Never", hint: "Always on site" },
              { value: 1, label: "1 day" },
              { value: 2, label: "2 days" },
              { value: 3, label: "3+ days", hint: "Mostly from home" },
            ]}
          />
        </>
      )}

      {/* ── Health insurance ──────────────────────────────────── */}
      <SectionHeading>Health insurance</SectionHeading>

      <ChoiceGroup
        columns={2}
        label="Which country insures you?"
        value={healthValue}
        onChange={(value) =>
          patch(
            value === "UNKNOWN"
              ? { healthInsuranceCountry: undefined }
              : { healthInsuranceCountry: value as Country },
          )
        }
        options={[
          ...COUNTRIES.map((c) => ({
            value: c as string,
            label: `${COUNTRY_META[c].flag} ${COUNTRY_META[c].name}`,
          })),
          { value: "UNKNOWN", label: "I am not sure" },
        ]}
      />
    </div>
  );
}

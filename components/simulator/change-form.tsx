"use client";

/**
 * Turns the selected change type into a `LifeChange` patch.
 *
 * Only the fields a given change actually touches are asked for — the rest of
 * the profile carries over untouched.
 */
import { useEffect, useState } from "react";

import { ChoiceGroup, CityField, CountryPicker } from "@/components/onboarding/fields";
import { LIFE_CHANGE_META } from "@/lib/constants";
import type { Country, LifeChange, LifeChangeType, UserProfile } from "@/lib/types";

interface FormState {
  country?: Country;
  city: string;
  hours?: number;
  remoteDays?: number;
}

export function ChangeForm({
  type,
  profile,
  onChange,
}: {
  type: LifeChangeType;
  profile: UserProfile;
  onChange: (change: LifeChange | null) => void;
}) {
  const [state, setState] = useState<FormState>({ city: "" });

  // Reset whenever the user picks a different change type.
  useEffect(() => {
    setState({ city: "" });
  }, [type]);

  useEffect(() => {
    onChange(buildChange(type, state, profile));
    // `onChange` is expected to be stable; profile changes rarely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, state, profile]);

  const set = (patch: Partial<FormState>) => setState((s) => ({ ...s, ...patch }));

  switch (type) {
    case "NEW_JOB":
    case "CHANGE_EMPLOYER":
      return (
        <div className="space-y-6">
          <CountryPicker
            label={LIFE_CHANGE_META[type].question}
            value={state.country}
            onChange={(country) => set({ country })}
          />
          <CityField value={state.city} country={state.country} onChange={(city) => set({ city })} />
          <ChoiceGroup
            label="How many hours per week?"
            columns={4}
            value={state.hours}
            onChange={(hours) => set({ hours })}
            options={[
              { value: 8, label: "Up to 8h" },
              { value: 16, label: "16h" },
              { value: 20, label: "20h" },
              { value: 40, label: "36–40h" },
            ]}
          />
        </div>
      );

    case "MOVE":
      return (
        <div className="space-y-6">
          <CountryPicker
            label={LIFE_CHANGE_META[type].question}
            value={state.country}
            onChange={(country) => set({ country })}
          />
          <CityField value={state.city} country={state.country} onChange={(city) => set({ city })} />
        </div>
      );

    case "REMOTE_WORK":
      return (
        <ChoiceGroup
          label={LIFE_CHANGE_META[type].question}
          columns={4}
          value={state.remoteDays}
          onChange={(remoteDays) => set({ remoteDays })}
          options={[
            { value: 1, label: "1 day" },
            { value: 2, label: "2 days" },
            { value: 3, label: "3 days" },
            { value: 4, label: "4+ days" },
          ]}
        />
      );

    case "CHANGE_WORK_HOURS":
      return (
        <ChoiceGroup
          label={LIFE_CHANGE_META[type].question}
          columns={4}
          value={state.hours}
          onChange={(hours) => set({ hours })}
          options={[
            { value: 8, label: "Up to 8h" },
            { value: 16, label: "16h" },
            { value: 20, label: "20h" },
            { value: 40, label: "36–40h" },
          ]}
        />
      );

    case "GRADUATION":
    case "START_STUDY":
      return (
        <p className="text-sm text-muted-foreground">
          No extra details needed — we will compare your situation with and without student status.
        </p>
      );
  }
}

/** Returns null while the form is incomplete, so the caller can disable "Simulate". */
function buildChange(
  type: LifeChangeType,
  state: FormState,
  profile: UserProfile,
): LifeChange | null {
  switch (type) {
    case "NEW_JOB":
    case "CHANGE_EMPLOYER":
      if (!state.country || !state.hours) return null;
      return {
        type,
        patch: {
          isEmployed: true,
          workCountry: state.country,
          workCity: state.city.trim() || undefined,
          workHoursPerWeek: state.hours,
          remoteWorkDaysPerWeek: profile.remoteWorkDaysPerWeek ?? 0,
        },
      };

    case "MOVE":
      if (!state.country) return null;
      return {
        type,
        patch: { residenceCountry: state.country, residenceCity: state.city.trim() || "" },
      };

    case "REMOTE_WORK":
      if (state.remoteDays === undefined) return null;
      return { type, patch: { remoteWorkDaysPerWeek: state.remoteDays } };

    case "CHANGE_WORK_HOURS":
      if (!state.hours) return null;
      return { type, patch: { workHoursPerWeek: state.hours } };

    case "GRADUATION":
      return { type, patch: { isStudent: false } };

    case "START_STUDY":
      return { type, patch: { isStudent: true, studyCountry: profile.residenceCountry } };
  }
}

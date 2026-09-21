"use client";

/** Reusable form controls for the onboarding wizard. */
import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { CountryMark } from "@/components/shared/country-badge";
import { Label } from "@/components/ui/label";
import { COUNTRIES, COUNTRY_META } from "@/lib/constants";
import type { Country } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CountryPicker({
  value,
  onChange,
  label,
}: {
  value?: Country;
  onChange: (c: Country) => void;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="grid gap-3 sm:grid-cols-3">
        {COUNTRIES.map((country) => {
          const meta = COUNTRY_META[country];
          const selected = value === country;
          return (
            <button
              key={country}
              type="button"
              onClick={() => onChange(country)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors",
                selected
                  ? "border-primary bg-secondary"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <CountryMark country={country} size="lg" />
              <span className="flex-1">
                <span className="block text-sm font-medium">{meta.name}</span>
                <span className="block text-xs text-muted-foreground">{country}</span>
              </span>
              {selected && <Check className="size-4 text-primary" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CityField({
  value,
  onChange,
  country,
  label = "City",
}: {
  value: string;
  onChange: (v: string) => void;
  country?: Country;
  label?: string;
}) {
  const suggestions = country ? COUNTRY_META[country].cities : [];

  return (
    <div className="space-y-2">
      <Label htmlFor={`city-${label}`}>{label}</Label>
      <Input
        id={`city-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={suggestions[0] ? `e.g. ${suggestions[0]}` : "City"}
        list={country ? `cities-${country}` : undefined}
      />
      {country && (
        <datalist id={`cities-${country}`}>
          {suggestions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      )}
    </div>
  );
}

export function ChoiceGroup<T extends string | number | boolean>({
  value,
  onChange,
  options,
  label,
  columns = 2,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; hint?: string }>;
  label?: string;
  columns?: 2 | 3 | 4;
}) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div
        className={cn(
          "grid gap-3",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
          columns === 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-colors",
                selected
                  ? "border-primary bg-secondary"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              {option.hint && (
                <span className="block text-xs text-muted-foreground">{option.hint}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

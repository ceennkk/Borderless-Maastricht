import { ArrowLeftRight } from "lucide-react";

import { CountryChip } from "@/components/shared/country-badge";
import { COUNTRY_META } from "@/lib/constants";
import { relevantCountries } from "@/lib/opportunities";
import type { UserProfile } from "@/lib/types";

/**
 * "Your cross-border life — 🇳🇱 Netherlands ↔ 🇩🇪 Germany"
 * The one line that tells the user the app understood their situation.
 */
export function CrossBorderHeader({ profile }: { profile: UserProfile }) {
  const countries = relevantCountries(profile);

  return (
    <header className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Your cross-border life
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {countries.map((country, i) => (
          <span key={country} className="flex items-center gap-3">
            {i > 0 && <ArrowLeftRight className="size-5 text-muted-foreground" aria-hidden />}
            <span className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              <span aria-hidden>{COUNTRY_META[country].flag}</span>
              {COUNTRY_META[country].name}
            </span>
          </span>
        ))}
      </div>

      <p className="text-muted-foreground">
        {summarise(profile)}
      </p>
    </header>
  );
}

function summarise(p: UserProfile): string {
  const parts: string[] = [`Living in ${p.residenceCity || COUNTRY_META[p.residenceCountry].name}`];

  if (p.isStudent && p.studyCountry) {
    parts.push(`studying in ${p.studyCity || COUNTRY_META[p.studyCountry].name}`);
  }
  if (p.isEmployed && p.workCountry) {
    const hours = p.workHoursPerWeek ? ` (${p.workHoursPerWeek}h/week)` : "";
    parts.push(`working in ${p.workCity || COUNTRY_META[p.workCountry].name}${hours}`);
  }

  return `${parts.join(", ")}.`;
}

export { CountryChip };

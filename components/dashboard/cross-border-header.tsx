import { ArrowLeftRight, CheckCircle2, CircleSlash, Hourglass } from "lucide-react";

import { CountryChip } from "@/components/shared/country-badge";
import { COUNTRY_META, REGISTRATION_STATUS_META } from "@/lib/constants";
import { relevantCountries } from "@/lib/opportunities";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * "Your cross-border life — 🇳🇱 Netherlands ↔ 🇩🇪 Germany"
 * The one line that tells the user the app understood their situation.
 */
export function CrossBorderHeader({ profile }: { profile: UserProfile }) {
  const countries = relevantCountries(profile);

  return (
    <header className="space-y-5 border-b border-border pb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Your cross-border life
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {countries.map((country, i) => (
          <span key={country} className="flex items-center gap-4">
            {i > 0 && <ArrowLeftRight className="size-5 text-border" aria-hidden />}
            <span className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
              {COUNTRY_META[country].name}
            </span>
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-6">
        <p className="text-muted-foreground">{summarise(profile)}</p>
        <RegistrationStatusBadge profile={profile} />
      </div>
    </header>
  );
}

/**
 * Shows whether the user is registered in their city of residence.
 * A pending registration is surfaced with an hourglass so it reads as
 * "in progress" at a glance.
 */
function RegistrationStatusBadge({ profile }: { profile: UserProfile }) {
  const status = profile.registrationStatus;
  if (!status) return null;

  const city = profile.residenceCity || COUNTRY_META[profile.residenceCountry].name;

  const config = {
    registered: {
      Icon: CheckCircle2,
      label: `Registered in ${city}`,
      className: "border-transparent bg-secondary text-secondary-foreground",
    },
    not_registered: {
      Icon: CircleSlash,
      label: `Not registered in ${city}`,
      className: "border-border text-muted-foreground",
    },
    in_progress: {
      Icon: Hourglass,
      label: `${REGISTRATION_STATUS_META.in_progress.short} in ${city}`,
      className: "border-transparent bg-muted text-foreground",
    },
  }[status];

  const { Icon } = config;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-l-2 pl-2 text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {config.label}
    </span>
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

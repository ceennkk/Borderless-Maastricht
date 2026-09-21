import { ArrowRight, CheckCircle2, CircleSlash, Hourglass } from "lucide-react";

import { CountryChip, CountryMark } from "@/components/shared/country-badge";
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
    <header className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {profile.name ? `Hi ${profile.name}` : "Your cross-border life"}
      </h1>

      <div className="flex flex-wrap items-center gap-2">
        {countries.map((country, i) => (
          <span key={country} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="size-4 text-muted-foreground" />}
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium">
              <CountryMark country={country} />
              {COUNTRY_META[country].name}
            </span>
          </span>
        ))}
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
      className: "border-transparent bg-ok-surface text-ok-foreground",
    },
    not_registered: {
      Icon: CircleSlash,
      label: `Not registered in ${city}`,
      className: "border-border text-muted-foreground",
    },
    in_progress: {
      Icon: Hourglass,
      label: `${REGISTRATION_STATUS_META.in_progress.short} in ${city}`,
      className: "border-transparent bg-check-surface text-check-foreground",
    },
  }[status];

  const { Icon } = config;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
        config.className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {config.label}
    </span>
  );
}

export { CountryChip };

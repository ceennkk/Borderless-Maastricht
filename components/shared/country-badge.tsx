import { COUNTRY_META } from "@/lib/constants";
import type { Country } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The canonical way to show a country anywhere in Borderless.
 * Flag + code keeps NL/DE/BE instantly recognisable without colour-coding
 * the whole interface.
 */
export function CountryBadge({
  country,
  city,
  size = "default",
  className,
}: {
  country: Country;
  city?: string;
  size?: "sm" | "default";
  className?: string;
}) {
  const meta = COUNTRY_META[country];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-card font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
        className,
      )}
      title={meta.name}
    >
      <span aria-hidden>{meta.flag}</span>
      <span>{city ? `${city}` : meta.name}</span>
      {city && <span className="text-muted-foreground">{country}</span>}
    </span>
  );
}

/** Just the flag and the two-letter code — for dense contexts. */
export function CountryChip({ country, className }: { country: Country; className?: string }) {
  const meta = COUNTRY_META[country];
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-sm font-medium", className)}
      title={meta.name}
    >
      <span aria-hidden>{meta.flag}</span>
      {country}
    </span>
  );
}

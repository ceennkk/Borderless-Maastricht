import { COUNTRY_META } from "@/lib/constants";
import type { Country } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Minimal country mark: the flag reduced to three softened stripes in a small
 * rounded tile. Replaces emoji flags, which render differently per platform.
 */
const MARK: Record<Country, { direction: "row" | "col"; stripes: [string, string, string] }> = {
  NL: { direction: "col", stripes: ["#C8413B", "#F4F4F2", "#2F4F8F"] },
  DE: { direction: "col", stripes: ["#26262B", "#C8413B", "#E3B23C"] },
  BE: { direction: "row", stripes: ["#26262B", "#E8C547", "#C8413B"] },
};

export function CountryMark({
  country,
  size = "default",
  className,
}: {
  country: Country;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const mark = MARK[country];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10",
        mark.direction === "col" ? "flex-col" : "flex-row",
        size === "sm" && "h-2.5 w-3.5",
        size === "default" && "h-3 w-[18px]",
        size === "lg" && "h-5 w-7 rounded-[4px]",
        className,
      )}
    >
      {mark.stripes.map((color, i) => (
        <span key={i} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

/**
 * The canonical way to show a country anywhere in Borderless.
 * Mark + code keeps NL/DE/BE instantly recognisable without colour-coding
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
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
        className,
      )}
      title={meta.name}
    >
      <CountryMark country={country} size={size === "sm" ? "sm" : "default"} />
      <span>{city ? `${city}` : meta.name}</span>
      {city && <span className="text-muted-foreground">{country}</span>}
    </span>
  );
}

/** Just the mark and the two-letter code — for dense contexts. */
export function CountryChip({ country, className }: { country: Country; className?: string }) {
  const meta = COUNTRY_META[country];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm font-medium", className)}
      title={meta.name}
    >
      <CountryMark country={country} size="sm" />
      {country}
    </span>
  );
}

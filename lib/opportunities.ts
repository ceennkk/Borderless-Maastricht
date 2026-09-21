/**
 * Opportunity matching.
 *
 * Kept apart from rules.ts on purpose: impacts are obligations, opportunities
 * are benefits, and the two are owned by different developers. The matching is
 * currently a simple relevance filter over mock data.
 */
import { MOCK_OPPORTUNITIES } from "./mock-data";
import type { Country, Opportunity, UserProfile } from "./types";

/** Countries the user touches in daily life. */
export function relevantCountries(profile: UserProfile): Country[] {
  const set = new Set<Country>([profile.residenceCountry]);
  if (profile.isStudent && profile.studyCountry) set.add(profile.studyCountry);
  if (profile.isEmployed && profile.workCountry) set.add(profile.workCountry);
  return Array.from(set);
}

/**
 * Opportunities worth showing this user, most relevant first.
 * Returns everything when no profile is available.
 */
export function getOpportunities(profile?: UserProfile | null): Opportunity[] {
  if (!profile) return MOCK_OPPORTUNITIES;

  const countries = relevantCountries(profile);

  return MOCK_OPPORTUNITIES.filter((o) => {
    if (!o.countries || o.countries.length === 0) return true;
    return o.countries.some((c) => countries.includes(c));
  })
    .filter((o) => (o.category === "STUDENT" ? profile.isStudent : true))
    .sort((a, b) => score(b, profile) - score(a, profile));
}

function score(o: Opportunity, profile: UserProfile): number {
  let s = 0;
  if (o.category === "STUDENT" && profile.isStudent) s += 2;
  if (o.category === "WORK" && !profile.isEmployed) s += 2;
  if (o.category === "FINANCE" && profile.isEmployed) s += 1;
  if (o.category === "TRANSPORT" && profile.workCountry !== profile.residenceCountry) s += 2;
  return s;
}

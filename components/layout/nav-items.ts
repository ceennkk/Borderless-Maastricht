import { Compass, LayoutGrid, ListChecks, Split, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** Shorter label for the mobile bottom bar. */
  shortLabel: string;
  icon: LucideIcon;
}

/** Primary navigation — the four places a user spends their time. */
export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutGrid },
  { href: "/simulator", label: "What If?", shortLabel: "What If?", icon: Split },
  { href: "/actions", label: "Actions", shortLabel: "Actions", icon: ListChecks },
  { href: "/opportunities", label: "Opportunities", shortLabel: "Perks", icon: Compass },
];

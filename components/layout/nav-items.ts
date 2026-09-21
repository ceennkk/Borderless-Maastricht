import { Compass, LayoutGrid, ListChecks, Split, History, Users, FileText, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** Shorter label for the mobile bottom bar. */
  shortLabel: string;
  icon: LucideIcon;
}

/** Primary navigation — the four places a user spends their time. */
export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "My Status", shortLabel: "Status", icon: LayoutGrid },
  { href: "/simulations", label: "Saved Plans", shortLabel: "Plans", icon: History },
  { href: "/simulator", label: "Plan a Change", shortLabel: "Plan Change", icon: Split },
  { href: "/actions", label: "My To-Dos", shortLabel: "To-Dos", icon: ListChecks },
  { href: "/opportunities", label: "Benefits & Tips", shortLabel: "Benefits", icon: Compass },
  { href: "/forms", label: "Form Assistant", shortLabel: "Forms", icon: FileText },
  { href: "/community", label: "Community", shortLabel: "Community", icon: Users },
];

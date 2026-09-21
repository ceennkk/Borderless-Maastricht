import {
  Briefcase,
  FileText,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import type { ImpactCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<ImpactCategory, LucideIcon> = {
  HEALTH_INSURANCE: HeartPulse,
  SOCIAL_SECURITY: ShieldCheck,
  TAX: Landmark,
  REGISTRATION: FileText,
  RESIDENCE: Home,
  EMPLOYMENT: Briefcase,
  STUDENT_STATUS: GraduationCap,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: ImpactCategory;
  className?: string;
}) {
  const Icon = CATEGORY_ICON[category];
  return <Icon className={cn("size-5", className)} aria-hidden />;
}

export { CATEGORY_ICON };

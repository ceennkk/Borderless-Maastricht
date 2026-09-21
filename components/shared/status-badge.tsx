import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";

import { IMPACT_STATUS_META } from "@/lib/constants";
import type { ImpactStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<ImpactStatus, { chip: string; dot: string; icon: typeof CheckCircle2 }> = {
  OK: {
    chip: "bg-ok-surface text-ok-foreground border-ok/25",
    dot: "bg-ok",
    icon: CheckCircle2,
  },
  CHECK: {
    chip: "bg-check-surface text-check-foreground border-check/30",
    dot: "bg-check",
    icon: CircleAlert,
  },
  ACTION: {
    chip: "bg-action-surface text-action-foreground border-action/30",
    dot: "bg-action",
    icon: AlertTriangle,
  },
};

/** Status is the app's core signal — always rendered through this component. */
export function StatusBadge({
  status,
  className,
  showIcon = true,
}: {
  status: ImpactStatus;
  className?: string;
  showIcon?: boolean;
}) {
  const style = STATUS_STYLE[status];
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        style.chip,
        className,
      )}
    >
      {showIcon && <Icon className="size-3.5" aria-hidden />}
      {IMPACT_STATUS_META[status].label}
    </span>
  );
}

export function StatusDot({ status, className }: { status: ImpactStatus; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 rounded-full", STATUS_STYLE[status].dot, className)}
      aria-label={IMPACT_STATUS_META[status].label}
    />
  );
}

export { STATUS_STYLE };

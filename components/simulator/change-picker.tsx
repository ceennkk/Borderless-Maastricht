"use client";

import { Briefcase, Clock, GraduationCap, Home, Laptop, type LucideIcon } from "lucide-react";

import { LIFE_CHANGE_META, SIMULATOR_CHANGE_TYPES } from "@/lib/constants";
import type { LifeChangeType } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICON: Partial<Record<LifeChangeType, LucideIcon>> = {
  NEW_JOB: Briefcase,
  MOVE: Home,
  REMOTE_WORK: Laptop,
  CHANGE_WORK_HOURS: Clock,
  GRADUATION: GraduationCap,
  START_STUDY: GraduationCap,
  CHANGE_EMPLOYER: Briefcase,
};

/** "What are you considering?" — the simulator's entry point. */
export function ChangePicker({
  selected,
  onSelect,
}: {
  selected?: LifeChangeType;
  onSelect: (type: LifeChangeType) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SIMULATOR_CHANGE_TYPES.map((type) => {
        const meta = LIFE_CHANGE_META[type];
        const Icon = ICON[type] ?? Briefcase;
        const active = selected === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            aria-pressed={active}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-5 text-left transition-colors",
              active ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/40",
            )}
          >
            <Icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} aria-hidden />
            <span className="font-medium">{meta.label}</span>
            <span className="text-sm leading-relaxed text-muted-foreground">{meta.description}</span>
          </button>
        );
      })}
    </div>
  );
}

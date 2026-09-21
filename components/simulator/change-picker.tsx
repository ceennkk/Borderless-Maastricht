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
    <div className="grid overflow-hidden border border-border bg-border sm:grid-cols-2">
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
              "flex min-h-32 gap-4 border-b border-r border-border bg-card p-5 text-left transition-colors last:sm:col-span-2",
              active ? "bg-secondary" : "hover:bg-surface",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center border border-border",
                active ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold">{meta.label}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {meta.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

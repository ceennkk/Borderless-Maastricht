"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MAIN_NAV } from "./nav-items";
import { cn } from "@/lib/utils";
import { loadSimulations } from "@/lib/storage";
import type { SavedSimulation } from "@/lib/types";
import { LIFE_CHANGE_META } from "@/lib/constants";

/** Sidebar navigation (desktop). */
export function MainNav() {
  const pathname = usePathname();
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);

  useEffect(() => {
    setSimulations(loadSimulations());
  }, [pathname]);

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {MAIN_NAV.map((item) => {
        // When checking if the parent "Saved Plans" tab is active, 
        // we don't want it to light up exactly the same as the sub-item, 
        // but it should still indicate we are in that section.
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        
        return (
          <div key={item.href} className="flex flex-col gap-1">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-secondary-foreground before:absolute before:inset-y-2 before:-left-4 before:w-[3px] before:rounded-r-full before:bg-signal [&_svg]:text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>

            {item.href === "/simulations" && simulations.length > 0 && active && (
              <div className="ml-6 flex flex-col gap-1 border-l border-border pl-3">
                {simulations.map((sim) => {
                  const simHref = `/simulations/${sim.id}`;
                  const simActive = pathname === simHref;
                  const label = LIFE_CHANGE_META[sim.result.change.type]?.label || "Saved Plan";
                  return (
                    <Link
                      key={sim.id}
                      href={simHref}
                      className={cn(
                        "block truncate rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                        simActive
                          ? "bg-secondary text-secondary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/** Fixed bottom bar (mobile). */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        {MAIN_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-primary [&_svg]:text-signal" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {item.shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

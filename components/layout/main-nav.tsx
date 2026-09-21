"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MAIN_NAV } from "./nav-items";
import { cn } from "@/lib/utils";

/** Sidebar navigation (desktop). */
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {MAIN_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
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
      <div className="mx-auto grid max-w-lg grid-cols-4">
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

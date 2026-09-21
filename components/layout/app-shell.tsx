"use client";

/**
 * Application shell: sidebar + content on desktop, top bar + bottom nav on mobile.
 *
 * Chromeless routes (landing, onboarding) render their children bare so the
 * focus stays on the flow. Everything else gets the shell automatically —
 * feature pages never have to think about navigation.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, User } from "lucide-react";

import { AskBorderlessPanel } from "./ask-borderless-panel";
import { Logo } from "./logo";
import { MainNav, MobileNav } from "./main-nav";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";

/** Routes that render without navigation. */
const CHROMELESS = ["/", "/onboarding"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [askOpen, setAskOpen] = useState(false);
  const { profile, impacts } = useProfile();

  if (CHROMELESS.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-68 shrink-0 flex-col bg-sidebar px-5 py-6 text-sidebar-foreground md:flex">
        <Logo href="/dashboard" inverted className="px-2" />

        <p className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">
          Maastricht Euregio
        </p>

        <div className="mt-8 flex-1">
          <MainNav />
        </div>

        <div className="space-y-1 border-t border-sidebar-foreground/15 pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-sidebar-foreground/70 hover:bg-sidebar-foreground/8 hover:text-sidebar-foreground"
            onClick={() => setAskOpen(true)}
          >
            <Sparkles className="size-4" />
            Ask Borderless
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-sidebar-foreground/70 hover:bg-sidebar-foreground/8 hover:text-sidebar-foreground"
          >
            <Link href="/profile">
              <User className="size-4" />
              {profile.name || "Profile"}
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Logo href="/dashboard" />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setAskOpen(true)} aria-label="Ask Borderless">
            <Sparkles />
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Profile">
            <Link href="/profile">
              <User />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-7 lg:px-10 lg:py-14">{children}</div>
      </main>

      <MobileNav />

      <AskBorderlessPanel
        open={askOpen}
        onClose={() => setAskOpen(false)}
        profile={profile}
        impacts={impacts}
      />
    </div>
  );
}

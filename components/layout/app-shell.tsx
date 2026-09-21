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
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-5 md:flex">
        <Logo href="/dashboard" className="px-2" />

        <div className="mt-8 flex-1">
          <MainNav />
        </div>

        <div className="space-y-1 border-t border-border pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setAskOpen(true)}
          >
            <Sparkles className="size-4" />
            Ask Borderless
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
          >
            <Link href="/profile">
              <User className="size-4" />
              {profile.name || "Profile"}
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
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
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">{children}</div>
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

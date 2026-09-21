"use client";

/** Read-only view of the stored profile, with a way to redo onboarding. */
import Link from "next/link";
import { Pencil, RotateCcw } from "lucide-react";

import { CountryBadge } from "@/components/shared/country-badge";
import { PageHeader } from "@/components/shared/page-header";
import { PersonalDetailsForm } from "@/components/shared/personal-details-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import type { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const { profile, isDemo, ready, reset } = useProfile();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your profile"
        description="Everything Borderless knows about you. Stored on this device only."
        action={
          <Button asChild variant="outline">
            <Link href="/onboarding">
              <Pencil />
              Update
            </Link>
          </Button>
        }
      />

      {ready && isDemo && (
        <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          This is the demo profile. Complete onboarding to replace it with your own.
        </div>
      )}

      <Card className="divide-y divide-border">
        <Row label="Name" value={profile.name} />
        <Row
          label="Lives in"
          value={<CountryBadge country={profile.residenceCountry} city={profile.residenceCity} />}
        />
        <Row
          label="Studies"
          value={
            profile.isStudent && profile.studyCountry ? (
              <CountryBadge country={profile.studyCountry} city={profile.studyCity} />
            ) : (
              "Not a student"
            )
          }
        />
        <Row
          label="Works"
          value={
            profile.isEmployed && profile.workCountry ? (
              <CountryBadge country={profile.workCountry} city={profile.workCity} />
            ) : (
              "Not employed"
            )
          }
        />
        <Row label="Working hours" value={hours(profile)} />
        <Row label="Remote work" value={remote(profile)} />
        <Row
          label="Citizenship"
          value={`${profile.citizenship}${profile.euCitizen ? " · EU/EEA" : " · Non-EU"}`}
        />
        <Row
          label="Health insurance"
          value={
            profile.healthInsuranceCountry ? (
              <CountryBadge country={profile.healthInsuranceCountry} />
            ) : (
              "Unknown"
            )
          }
        />
      </Card>

      <PersonalDetailsForm />

      <div>
        <Button variant="ghost" onClick={reset} className="text-muted-foreground">
          <RotateCcw />
          Reset all local data
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function hours(p: UserProfile): string {
  return p.isEmployed && p.workHoursPerWeek ? `${p.workHoursPerWeek} hours per week` : "—";
}

function remote(p: UserProfile): string {
  if (!p.isEmployed || p.remoteWorkDaysPerWeek === undefined) return "—";
  if (p.remoteWorkDaysPerWeek === 0) return "Always on site";
  return `${p.remoteWorkDaysPerWeek} day${p.remoteWorkDaysPerWeek === 1 ? "" : "s"} per week`;
}

"use client";

/** Editable view of the stored profile, with an option to redo onboarding. */
import Link from "next/link";
import { ClipboardList, RotateCcw } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PersonalDetailsForm } from "@/components/shared/personal-details-form";
import { ProfileEditForm } from "@/components/shared/profile-edit-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";

export default function ProfilePage() {
  const { isDemo, ready, reset } = useProfile();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your profile"
        description="Everything Borderless knows about you. Stored on this device only."
        action={
          <Button asChild variant="outline">
            <Link href="/onboarding">
              <ClipboardList />
              Redo questionary
            </Link>
          </Button>
        }
      />

      {ready && isDemo && (
        <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          This is the demo profile. Complete onboarding to replace it with your own.
        </div>
      )}

      <Card className="p-6 sm:p-8">
        <ProfileEditForm />
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

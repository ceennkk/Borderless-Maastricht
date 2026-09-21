"use client";

/** Editable view of the stored profile, with an option to redo onboarding. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, RotateCcw } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PersonalDetailsForm } from "@/components/shared/personal-details-form";
import { ProfileEditForm } from "@/components/shared/profile-edit-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";

export default function ProfilePage() {
  const router = useRouter();
  const { isDemo, ready, reset } = useProfile();

  function resetAllLocalData() {
    const confirmed = window.confirm(
      "Reset all Borderless data stored in this browser? Your profile, todos, saved simulations and personal details will be permanently deleted.",
    );
    if (!confirmed) return;

    reset();
    router.replace("/onboarding?reset=1");
  }

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
        <div className="border-l-2 border-primary bg-surface px-4 py-3 text-sm text-muted-foreground">
          This is the demo profile. Complete onboarding to replace it with your own.
        </div>
      )}

      <Card className="rounded-none p-6 sm:p-8">
        <ProfileEditForm />
      </Card>

      <PersonalDetailsForm />

      <div>
        <Button variant="ghost" onClick={resetAllLocalData} className="text-muted-foreground">
          <RotateCcw />
          Reset all local data
        </Button>
      </div>
    </div>
  );
}

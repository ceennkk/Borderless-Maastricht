"use client";

/**
 * Where the user stores the details that get filled into drafts.
 *
 * Framed honestly: this is the most sensitive data in the app, it stays on the
 * device, and it is never sent to the language model. Everything is optional —
 * a missing value just leaves a placeholder in the letter.
 */
import { Lock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { usePersonalDetails } from "@/hooks/use-personal-details";
import { PERSONAL_DETAIL_FIELDS, detailsProgress } from "@/lib/personal-details";

export function PersonalDetailsForm() {
  const { details, update, clear } = usePersonalDetails();
  const { filled, total } = detailsProgress(details);

  return (
    <Card className="space-y-5 p-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold tracking-tight">Details for letters and forms</h2>
          <span className="text-xs text-muted-foreground">
            {filled} of {total} filled
          </span>
        </div>
        <Progress value={(filled / total) * 100} />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Fill these in once and every drafted message arrives complete instead of full of
          placeholders. All optional.
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-lg border border-ok/25 bg-ok-surface px-3 py-2 text-xs text-ok-foreground">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          Stored in this browser only. <strong className="font-medium">Never sent to the AI</strong>{" "}
          — drafts are written with placeholders and filled in here on your device.
        </span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {PERSONAL_DETAIL_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`pd-${field.key}`}>{field.label}</Label>
            <Input
              id={`pd-${field.key}`}
              type={field.type ?? "text"}
              defaultValue={details[field.key] ?? ""}
              placeholder={field.hint ?? ""}
              onBlur={(e) => update({ [field.key]: e.target.value.trim() })}
            />
            {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
          </div>
        ))}
      </div>

      {filled > 0 && (
        <div className="border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">
            <Trash2 />
            Delete these details
          </Button>
        </div>
      )}
    </Card>
  );
}

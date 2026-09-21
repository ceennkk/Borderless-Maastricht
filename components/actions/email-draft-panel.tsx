"use client";

/**
 * Draft review, with the user's own details already filled in.
 *
 * The substitution happens here, in the browser (`fillDraft`). The model wrote
 * the letter with placeholders and never saw a BSN, a Steuer-ID or a date of
 * birth — those live only on this device.
 *
 * Borderless still has no outbox: the buttons open a mail client or copy text.
 */
import { useMemo, useState } from "react";
import { Check, ClipboardCopy, Lock, Mail, TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthority } from "@/lib/authorities";
import {
  PERSONAL_DETAIL_FIELDS,
  fillDraft,
  type PersonalDetails,
} from "@/lib/personal-details";
import { buildMailtoUrl, copyDraft } from "@/lib/scheduling";
import type { MessageDraft, ScheduleItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const LANGUAGE_LABEL: Record<MessageDraft["language"], string> = {
  nl: "Dutch",
  de: "German",
  fr: "French",
  en: "English",
};

export function EmailDraftPanel({
  item,
  draft,
  details,
  onUpdateDetails,
  onClose,
}: {
  item: ScheduleItem;
  draft: MessageDraft;
  details: PersonalDetails;
  onUpdateDetails: (patch: Partial<PersonalDetails>) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const authority = item.authorityId ? getAuthority(item.authorityId) : undefined;

  const filled = useMemo(() => fillDraft(draft, details), [draft, details]);

  async function handleCopy() {
    if (await copyDraft(filled)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label="Message draft"
        className="fixed inset-x-4 top-[5vh] z-50 mx-auto flex max-h-[90vh] max-w-2xl flex-col rounded-xl border border-border bg-card shadow-lg"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="space-y-0.5">
            <h2 className="font-semibold leading-snug">{item.title}</h2>
            <p className="text-xs text-muted-foreground">
              Drafted in {LANGUAGE_LABEL[draft.language]}
              {authority ? ` for ${authority.name}` : ""}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {filled.filled.length > 0 && (
            <p className="flex items-start gap-2 rounded-lg border border-ok/25 bg-ok-surface px-3 py-2 text-xs text-ok-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                <strong className="font-medium">
                  {filled.filled.length} detail{filled.filled.length === 1 ? "" : "s"} filled in
                  from your profile
                </strong>{" "}
                — on this device. These were never sent to the language model; it only wrote the
                placeholders.
              </span>
            </p>
          )}

          {filled.missing.length > 0 && (
            <MissingFields
              missing={filled.missing}
              details={details}
              onUpdateDetails={onUpdateDetails}
            />
          )}

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Subject
            </p>
            <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">
              {filled.subject}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Message
            </p>
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-surface px-3 py-2 font-sans text-sm leading-relaxed">
              {filled.body}
            </pre>
          </div>

          <p className="text-xs text-muted-foreground">
            Read this before you send it. It was written automatically and may need correcting —
            you are the sender, not Borderless.
          </p>
        </div>

        <footer className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {filled.missing.length > 0
              ? `${filled.missing.length} placeholder${filled.missing.length === 1 ? "" : "s"} still to fill`
              : "Ready to send"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check /> : <ClipboardCopy />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button asChild>
              <a href={buildMailtoUrl(filled, authority?.email)}>
                <Mail />
                Open in my mail app
              </a>
            </Button>
          </div>
        </footer>
      </div>
    </>
  );
}

/**
 * Fill the gaps without leaving the draft.
 *
 * A placeholder we cannot map to a known field still gets shown, so the user
 * knows to edit it by hand in their mail client.
 */
function MissingFields({
  missing,
  details,
  onUpdateDetails,
}: {
  missing: string[];
  details: PersonalDetails;
  onUpdateDetails: (patch: Partial<PersonalDetails>) => void;
}) {
  const known = PERSONAL_DETAIL_FIELDS.filter((f) => !details[f.key]);

  return (
    <div className="space-y-3 rounded-lg border border-check/30 bg-check-surface px-4 py-3">
      <div className="flex items-start gap-2">
        <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-check-foreground" aria-hidden />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-check-foreground">
            Still to fill in
          </p>
          <p className="mt-0.5 text-xs text-check-foreground/80">
            {missing.join(" · ")}
          </p>
        </div>
      </div>

      {known.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {known.slice(0, 4).map((field) => (
            <div key={field.key} className="space-y-1">
              <Label htmlFor={`fill-${field.key}`} className="text-xs">
                {field.label}
              </Label>
              <Input
                id={`fill-${field.key}`}
                type={field.type ?? "text"}
                defaultValue=""
                placeholder={field.hint ?? field.label}
                className={cn("h-8 bg-card text-sm")}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value) onUpdateDetails({ [field.key]: value });
                }}
              />
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-check-foreground/70">
        Saved on this device only, and reused in every future draft.
      </p>
    </div>
  );
}

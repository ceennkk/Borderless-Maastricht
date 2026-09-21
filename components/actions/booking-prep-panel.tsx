"use client";

/**
 * Appointment preparation.
 *
 * Borderless does not book. What it does is remove the part that actually costs
 * time: knowing which of a portal's many services is yours, what to bring, and
 * having every form field ready to paste.
 *
 * Personal details come from local storage and are pasted by the user — they
 * are never transmitted anywhere by this panel.
 */
import { useState } from "react";
import { Check, ClipboardCopy, ExternalLink, FileText, Info, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PERSONAL_DETAIL_FIELDS,
  displayValue,
  type PersonalDetails,
} from "@/lib/personal-details";
import type { Authority, BookingService } from "@/lib/types";

export function BookingPrepPanel({
  authority,
  service,
  details,
  onUpdateDetails,
  onClose,
}: {
  authority: Authority;
  service: BookingService;
  details: PersonalDetails;
  onUpdateDetails: (patch: Partial<PersonalDetails>) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string, id: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked — the value is on screen to read anyway */
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label="Appointment preparation"
        className="fixed inset-x-4 top-[5vh] z-50 mx-auto flex max-h-[90vh] max-w-2xl flex-col rounded-xl border border-border bg-card shadow-lg"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="space-y-0.5">
            <h2 className="font-semibold leading-snug">Book at {authority.name}</h2>
            <p className="text-xs text-muted-foreground">
              Everything ready — you make the booking yourself.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* The single most useful thing: which service to pick. */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select this service
            </h3>
            <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-secondary/40 px-3 py-2.5">
              <div className="min-w-0 space-y-1">
                <p className="font-medium leading-snug">{service.serviceName}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{service.purpose}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => copy(service.serviceName, "service")}
              >
                {copied === "service" ? <Check /> : <ClipboardCopy />}
              </Button>
            </div>
            {service.navigationHint && (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {service.navigationHint}
              </p>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bring these
            </h3>
            <ul className="space-y-1.5">
              {service.documents.map((doc) => (
                <li key={doc} className="flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  {doc}
                </li>
              ))}
            </ul>
            {service.fee && (
              <p className="text-xs text-muted-foreground">Fee: {service.fee}</p>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What the form asks — your answers
            </h3>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {service.formFields.map((field) => {
                const key = field.detailKey as keyof PersonalDetails | undefined;
                // Shown the way the authority's country writes it, so it can be
                // pasted straight into the form.
                const value = key ? displayValue(key, details, authority.language) : undefined;
                const meta = PERSONAL_DETAIL_FIELDS.find((f) => f.key === key);

                return (
                  <li key={field.label} className="flex items-center gap-3 px-3 py-2">
                    <span className="w-40 shrink-0 text-sm text-muted-foreground">
                      {field.label}
                    </span>
                    {value ? (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{value}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => copy(value, field.label)}
                        >
                          {copied === field.label ? <Check /> : <ClipboardCopy />}
                        </Button>
                      </>
                    ) : key ? (
                      <Input
                        aria-label={meta?.label ?? field.label}
                        placeholder="Not stored yet"
                        className="h-8 flex-1 text-sm"
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v) onUpdateDetails({ [key]: v });
                        }}
                      />
                    ) : (
                      <span className="flex-1 text-sm text-muted-foreground">
                        You fill this on the portal
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-muted-foreground">
              Stored on this device. Nothing here is sent anywhere — you paste it into the portal
              yourself.
            </p>
          </section>

          {service.notes && (
            <p className="flex items-start gap-2 rounded-lg border border-check/30 bg-check-surface px-3 py-2 text-xs text-check-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {service.notes}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Portals rename their services from time to time. If you cannot find this one, look for
            the closest match under the same heading rather than assuming it is gone.
          </p>
        </div>

        <footer className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild>
            <a href={service.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Open the booking portal
            </a>
          </Button>
        </footer>
      </div>
    </>
  );
}

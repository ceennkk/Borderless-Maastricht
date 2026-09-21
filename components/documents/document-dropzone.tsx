"use client";

/**
 * Upload entry point.
 *
 * The consent line is not decoration: these documents carry salary, national ID
 * numbers and addresses, so the user is told what leaves the device before they
 * choose a file, not after.
 */
import { useRef, useState } from "react";
import { FileUp, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ACCEPT_ATTRIBUTE, DocumentError, getDocumentAnalyzer } from "@/lib/documents";
import type { DocumentAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DocumentDropzone({
  onAnalysed,
}: {
  onAnalysed: (analysis: DocumentAnalysis) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file?: File | null) {
    if (!file || pending) return;
    setError(null);
    setPending(true);
    try {
      onAnalysed(await getDocumentAnalyzer().analyze(file));
    } catch (e) {
      setError(
        e instanceof DocumentError ? e.message : "We could not read that document. Please try again.",
      );
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-primary bg-secondary" : "border-border bg-surface/60",
        )}
      >
        {pending ? (
          <>
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
            <p className="text-sm font-medium">Reading your document…</p>
            <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>
          </>
        ) : (
          <>
            <FileUp className="size-6 text-muted-foreground" aria-hidden />
            <div className="space-y-1">
              <p className="font-medium">Photograph or upload a document</p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                A contract, a payslip, a letter you do not understand. We read it and tell you what
                it changes for you.
              </p>
            </div>
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              Choose a file
            </Button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          onChange={(e) => void handle(e.target.files?.[0])}
        />
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          The image is sent to our document reader to be analysed and is <strong>not stored</strong>
          — not by us, not in a database. Location data is removed from photos before they leave your
          device. Only the values you confirm are kept, on this device.
        </span>
      </p>

      {error && (
        <p role="alert" className="rounded-lg border border-action/30 bg-action-surface px-3 py-2 text-sm text-action-foreground">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { FileUp, FileText, Loader2, Wand2, ShieldCheck, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

export function FormFillerView() {
  const { profile } = useProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  function handleFile(file?: File | null) {
    if (!file || pending) return;
    setPending(true);
    setResult(null);

    // Mock processing delay
    setTimeout(() => {
      setPending(false);
      setResult(generateMockExplanation(file.name));
    }, 2500);
  }

  function generateMockExplanation(filename: string) {
    return `### I've analysed "${filename}"

This looks like the **German Tax Registration Form (Fragebogen zur steuerlichen Erfassung)**. Since you live in the Netherlands and work in Germany, here is exactly how you should fill it out:

- **Field 1.1 (Steuernummer):** Leave this blank. The Finanzamt will assign you one.
- **Field 1.4 (Wohnsitz):** Enter your Dutch address. Do not use your employer's address.
- **Field 2.3 (Ansässigkeitsstaat):** Select "Niederlande" (Netherlands). This is critical for the double taxation treaty.
- **Field 3.1 (Einkunftsart):** Select "Einkünfte aus nichtselbständiger Arbeit" (Income from employment).

**Auto-Fill Ready:**
I can securely pre-fill this PDF with your profile details and generate a download link.

*(Note: This is a hackathon demo. In a real environment, we use OCR and PDF-lib to return a pre-filled PDF file right here!)*`;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Form Assistant"
        action={
          result ? (
            <Button variant="outline" onClick={() => setResult(null)}>
              Upload another form
            </Button>
          ) : undefined
        }
      />

      {!result && (
        <Card className="p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex flex-col items-center gap-4 rounded-xl border-2 border-dashed px-6 py-16 text-center transition-all cursor-pointer hover:border-primary/50 hover:bg-surface/80",
              dragging ? "border-primary bg-secondary/50 scale-[1.02]" : "border-border bg-surface/40",
            )}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? (
              <>
                <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Reading your form…</p>
                  <p className="text-sm text-muted-foreground">Analysing required fields based on your profile...</p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-surface p-4 border border-border">
                  <FileUp className="size-8 text-primary" aria-hidden />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Upload a blank PDF or Word form</p>
                  <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                    Upload a complex government form. Borderless AI will read it, explain what to fill in, or auto-fill it for you.
                  </p>
                </div>
                <Button variant="secondary" className="mt-2 pointer-events-none">
                  Select File
                </Button>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg bg-surface/50 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <p>
              <strong>100% Private:</strong> Your documents are processed entirely in memory. They are never saved to our servers, and all extracted data remains securely on your device.
            </p>
          </div>
        </Card>
      )}

      {result && (
        <Card className="overflow-hidden border-primary/20">
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex items-center gap-3">
            <Wand2 className="size-5 text-primary" />
            <h2 className="font-semibold text-primary">Form Analysis Complete</h2>
          </div>
          <div className="px-6 py-6 prose prose-sm max-w-none text-foreground prose-p:leading-relaxed prose-li:my-1">
            <ReactMarkdown
              components={{
                strong: ({ node: _, ...props }) => <strong className="font-semibold text-foreground" {...props} />
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
          <div className="bg-surface/50 px-6 py-4 border-t border-border flex justify-end gap-3">
            <Button variant="outline">
              Save Instructions
            </Button>
            <Button className="gap-2">
              <CheckCircle2 className="size-4" />
              Download Pre-filled PDF
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { FileUp, FileText, Loader2, Wand2, ShieldCheck, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

type FormAnalysisResult = {
  filename: string;
  formName: string;
  summary: string;
  fields: Array<{
    id: string;
    name: string;
    action: string;
    reason: string;
  }>;
};

export function FormFillerView() {
  const { profile } = useProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FormAnalysisResult | null>(null);

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

  function generateMockExplanation(filename: string): FormAnalysisResult {
    return {
      filename,
      formName: "German Tax Registration (Fragebogen zur steuerlichen Erfassung)",
      summary: "Since you live in the Netherlands and work in Germany, here is exactly how you should fill out this form based on your profile:",
      fields: [
        { id: "1.1", name: "Steuernummer", action: "Leave this blank", reason: "The Finanzamt will assign you one." },
        { id: "1.4", name: "Wohnsitz", action: "Enter your Dutch address", reason: "Do not use your employer's address." },
        { id: "2.3", name: "Ansässigkeitsstaat", action: "Select 'Niederlande'", reason: "This is critical for the double taxation treaty." },
        { id: "3.1", name: "Einkunftsart", action: "Select 'Einkünfte aus nichtselbständiger Arbeit'", reason: "Because your income is from employment." },
      ]
    };
  }

  function handleDownload() {
    const content = "This is a hackathon demo file.\\n\\nIn a real environment, this would be your original PDF file, with all the correct fields automatically pre-filled using OCR and PDF-lib based on your Borderless profile!";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pre-filled-form.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                  <p className="text-lg font-semibold">Upload a blank PDF, Word form, or Photo</p>
                  <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                    Upload a complex government form or take a picture of one. Borderless AI will read it, explain what to fill in, or auto-fill it for you.
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
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight">{result.formName}</h3>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>

            <div className="grid gap-3">
              {result.fields.map((field) => (
                <div key={field.id} className="rounded-lg border border-border p-4 bg-surface/50 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 items-center rounded bg-primary/10 px-2 text-xs font-semibold text-primary">
                        Field {field.id}
                      </span>
                      <span className="font-medium">{field.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-1">{field.reason}</p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground bg-background border border-border px-3 py-1.5 rounded-md shadow-sm">
                      {field.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
              <p><strong>Auto-Fill Ready:</strong> I can securely pre-fill this PDF with your profile details and generate a download link.</p>
            </div>
          </div>

          <div className="bg-surface/50 px-6 py-4 border-t border-border flex justify-end gap-3">
            <Button variant="outline" onClick={() => setResult(null)}>
              Start Over
            </Button>
            <Button className="gap-2" onClick={handleDownload}>
              <CheckCircle2 className="size-4" />
              Download Pre-filled Form
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

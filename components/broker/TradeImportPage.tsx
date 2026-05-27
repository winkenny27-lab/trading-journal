"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { parseImportCSV, type ImportResult } from "@/lib/utils/csvImport";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import type { Trade } from "@/lib/types/trade";

type Step = "upload" | "preview" | "done";

export function TradeImportPage({ userId }: { userId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState("");

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseImportCSV(text, userId);
      setResult(parsed);
      setStep("preview");
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    if (!result || result.trades.length === 0) return;
    setImporting(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase.from("trades").insert(result.trades as Trade[]);

    if (err) {
      setError(err.message);
      setImporting(false);
      return;
    }

    setImportedCount(result.trades.length);
    setStep("done");
    setImporting(false);
  }

  const formatLabel: Record<string, string> = {
    tradelog: "TradeLog Export",
    mt4: "MetaTrader 4",
    mt5: "MetaTrader 5",
    generic: "Generic CSV",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(["upload", "preview", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={14} className="text-[var(--muted)]" />}
            <span className={cn(
              "px-3 py-1 rounded-full font-medium",
              step === s ? "bg-brand-green/15 text-brand-green" : "text-[var(--muted)]"
            )}>
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-1">Import Trades</h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            Supports TradeLog exports, MetaTrader 4/5 history exports, and generic CSV files.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all",
              dragging
                ? "border-brand-green bg-brand-green/5"
                : "border-[var(--card-border)] hover:border-brand-green/50 hover:bg-white/2"
            )}
          >
            <Upload size={36} className="text-[var(--muted)] mb-3" />
            <p className="font-medium">Drop your CSV file here</p>
            <p className="text-sm text-[var(--muted)] mt-1">or click to browse</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />

          {error && (
            <p className="mt-4 text-sm text-red-400 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          <div className="mt-6 bg-[var(--input)] rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Supported Formats</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2"><FileText size={13} className="text-brand-green" /> TradeLog CSV Export</div>
              <div className="flex items-center gap-2"><FileText size={13} className="text-brand-green" /> MetaTrader 4 History</div>
              <div className="flex items-center gap-2"><FileText size={13} className="text-brand-green" /> MetaTrader 5 History</div>
              <div className="flex items-center gap-2"><FileText size={13} className="text-brand-green" /> Generic CSV</div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && result && (
        <div className="space-y-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-brand-green" />
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-[var(--muted)]">
                  Detected format: <span className="text-[var(--foreground)]">{formatLabel[result.format]}</span>
                  {" · "}{result.trades.length} trade{result.trades.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>
            <button
              onClick={() => { setStep("upload"); setResult(null); }}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Change file
            </button>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-400 mb-1">Parse warnings ({result.errors.length})</p>
              <ul className="text-xs text-yellow-400/80 space-y-0.5">
                {result.errors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
                {result.errors.length > 5 && <li>• ...and {result.errors.length - 5} more</li>}
              </ul>
            </div>
          )}

          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--card-border)]">
              <p className="text-sm font-medium">Preview (first 5 rows)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[var(--input)]">
                  <tr>
                    {["Instrument", "Direction", "Entry", "Exit", "P&L", "Result", "Entry Date"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-[var(--muted)] font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {result.trades.slice(0, 5).map((t, i) => (
                    <tr key={i} className="hover:bg-white/2">
                      <td className="px-4 py-2.5 font-medium">{t.instrument}</td>
                      <td className="px-4 py-2.5 capitalize">{t.direction}</td>
                      <td className="px-4 py-2.5">{t.entry_price ?? "—"}</td>
                      <td className="px-4 py-2.5">{t.exit_price ?? "—"}</td>
                      <td className={cn("px-4 py-2.5 font-medium",
                        (t.pnl ?? 0) > 0 ? "text-brand-green" : (t.pnl ?? 0) < 0 ? "text-red-400" : ""
                      )}>
                        {t.pnl != null ? `$${t.pnl.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 capitalize">{t.result}</td>
                      <td className="px-4 py-2.5 text-[var(--muted)]">
                        {t.entry_date ? new Date(t.entry_date).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.trades.length > 5 && (
              <div className="px-5 py-2.5 border-t border-[var(--card-border)] text-xs text-[var(--muted)]">
                +{result.trades.length - 5} more trades will be imported
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setStep("upload"); setResult(null); }}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--card-border)] hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={importing || result.trades.length === 0}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-brand-green text-black hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? "Importing..." : `Import ${result.trades.length} Trade${result.trades.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-brand-green/15 flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-brand-green" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Import Complete</h2>
          <p className="text-[var(--muted)] mb-8">
            {importedCount} trade{importedCount !== 1 ? "s" : ""} successfully imported to your journal.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setStep("upload"); setResult(null); setError(""); }}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--card-border)] hover:bg-white/5"
            >
              Import More
            </button>
            <button
              onClick={() => router.push("/trades")}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-brand-green text-black hover:bg-brand-green/90"
            >
              View Trade Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TradeResult } from "@/lib/types/trade";

interface CloseTradeButtonProps {
  tradeId: string;
  entryPrice: number;
  direction: "long" | "short";
}

const RESULTS: { value: TradeResult; label: string; color: string }[] = [
  { value: "win", label: "Win", color: "bg-brand-green text-white" },
  { value: "loss", label: "Loss", color: "bg-brand-red text-white" },
  { value: "breakeven", label: "Breakeven", color: "bg-gray-500 text-white" },
];

export function CloseTradeButton({ tradeId, entryPrice, direction }: CloseTradeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [exitPrice, setExitPrice] = useState("");
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 16));
  const [result, setResult] = useState<TradeResult>("win");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computedPnL = (() => {
    const ep = parseFloat(exitPrice);
    if (!ep || !entryPrice) return null;
    const diff = direction === "long" ? ep - entryPrice : entryPrice - ep;
    return Math.round(diff * 100) / 100;
  })();

  const handleClose = async () => {
    if (!exitPrice) { setError("Exit price is required."); return; }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const ep = parseFloat(exitPrice);
    const pnl = computedPnL;

    const { error: err } = await supabase
      .from("trades")
      .update({
        exit_price: ep,
        exit_date: new Date(exitDate).toISOString(),
        result,
        pnl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tradeId);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-semibold hover:bg-brand-green/90 transition-colors"
      >
        <CheckCircle size={14} />
        Close Trade
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative card w-full max-w-sm shadow-2xl p-6 space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">Close Trade</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Result selector */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-2">Result</label>
              <div className="flex gap-2">
                {RESULTS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setResult(r.value)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-semibold border transition-all",
                      result === r.value
                        ? r.color + " border-transparent"
                        : "border-[var(--card-border)] text-[var(--muted)] hover:border-gray-400"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exit price */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Exit Price</label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="0.00000"
                autoFocus
                className="input-base w-full"
              />
              {computedPnL !== null && (
                <p className={cn(
                  "text-xs font-semibold mt-1.5",
                  computedPnL >= 0 ? "text-brand-green" : "text-brand-red"
                )}>
                  Estimated P&L: {computedPnL >= 0 ? "+" : ""}{computedPnL} pts
                </p>
              )}
            </div>

            {/* Exit date */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Exit Date & Time</label>
              <input
                type="datetime-local"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                className="input-base w-full"
              />
            </div>

            {error && (
              <p className="text-xs text-brand-red bg-brand-red/10 border border-brand-red/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 text-sm rounded-lg border border-[var(--card-border)] hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-green text-white rounded-lg text-sm font-semibold hover:bg-brand-green/90 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {saving ? "Closing..." : "Confirm Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

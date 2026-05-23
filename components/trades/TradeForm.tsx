"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { InstrumentSelect } from "./InstrumentSelect";
import { EmotionSelector } from "./EmotionSelector";
import { ChecklistSection, type ChecklistResponse } from "./ChecklistSection";
import { calcRRFromPrices } from "@/lib/utils/tradeStats";
import type { Trade, TradeFormData, Direction, TradeResult, EmotionalState } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { Save, Loader2, ImagePlus, X } from "lucide-react";

interface TradeFormProps {
  initialData?: Trade;
  mode: "new" | "edit";
}

const defaultData: TradeFormData = {
  instrument: "",
  instrument_type: "forex_major",
  direction: "long",
  entry_price: "",
  stop_loss: "",
  take_profit: "",
  exit_price: "",
  lot_size: "",
  risk_amount: "",
  result: "open",
  entry_date: new Date().toISOString().slice(0, 16),
  exit_date: "",
  reason_for_entry: "",
  trade_narrative: "",
  exit_reason: "",
  emotional_state: "",
  tags: "",
};

function tradeToFormData(trade: Trade): TradeFormData {
  return {
    instrument: trade.instrument,
    instrument_type: trade.instrument_type,
    direction: trade.direction,
    entry_price: trade.entry_price?.toString() ?? "",
    stop_loss: trade.stop_loss?.toString() ?? "",
    take_profit: trade.take_profit?.toString() ?? "",
    exit_price: trade.exit_price?.toString() ?? "",
    lot_size: trade.lot_size?.toString() ?? "",
    risk_amount: trade.risk_amount?.toString() ?? "",
    result: trade.result,
    entry_date: trade.entry_date?.slice(0, 16) ?? "",
    exit_date: trade.exit_date?.slice(0, 16) ?? "",
    reason_for_entry: trade.reason_for_entry ?? "",
    trade_narrative: trade.trade_narrative ?? "",
    exit_reason: trade.exit_reason ?? "",
    emotional_state: trade.emotional_state ?? "",
    tags: trade.tags?.join(", ") ?? "",
  };
}

export function TradeForm({ initialData, mode }: TradeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<TradeFormData>(
    initialData ? tradeToFormData(initialData) : defaultData
  );
  const [checklistResponses, setChecklistResponses] = useState<ChecklistResponse[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  const set = (field: keyof TradeFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const computedRR = calcRRFromPrices(
    form.direction as Direction,
    parseFloat(form.entry_price),
    parseFloat(form.stop_loss),
    parseFloat(form.take_profit)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.instrument || !form.entry_price || !form.entry_date) {
      setError("Instrument, entry price, and entry date are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const exitPrice = parseFloat(form.exit_price) || null;
    const entryPrice = parseFloat(form.entry_price);
    const sl = parseFloat(form.stop_loss) || null;
    const tp = parseFloat(form.take_profit) || null;

    let pnl: number | null = null;
    if (exitPrice !== null) {
      const diff = form.direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
      const lots = parseFloat(form.lot_size) || 1;
      pnl = Math.round(diff * lots * 100) / 100;
    }

    const payload = {
      user_id: user.id,
      instrument: form.instrument,
      instrument_type: form.instrument_type,
      direction: form.direction as Direction,
      entry_price: entryPrice,
      stop_loss: sl,
      take_profit: tp,
      exit_price: exitPrice,
      lot_size: parseFloat(form.lot_size) || null,
      risk_amount: parseFloat(form.risk_amount) || null,
      pnl,
      rr_ratio: computedRR,
      result: form.result as TradeResult,
      entry_date: new Date(form.entry_date).toISOString(),
      exit_date: form.exit_date ? new Date(form.exit_date).toISOString() : null,
      reason_for_entry: form.reason_for_entry || null,
      trade_narrative: form.trade_narrative || null,
      exit_reason: form.exit_reason || null,
      emotional_state: (form.emotional_state as EmotionalState) || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };

    let tradeId: string;

    if (mode === "edit" && initialData) {
      const { error: err } = await supabase
        .from("trades")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", initialData.id);
      if (err) { setError(err.message); setSaving(false); return; }
      tradeId = initialData.id;
    } else {
      const { data, error: err } = await supabase.from("trades").insert(payload).select().single();
      if (err || !data) { setError(err?.message ?? "Failed to save trade"); setSaving(false); return; }
      tradeId = data.id;
    }

    if (checklistResponses.length > 0) {
      if (mode === "edit") {
        await supabase.from("trade_checklist_responses").delete().eq("trade_id", tradeId);
      }
      await supabase.from("trade_checklist_responses").insert(
        checklistResponses.map((r) => ({ ...r, trade_id: tradeId }))
      );
    }

    // Upload screenshots
    for (const file of selectedFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${tradeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("trade-screenshots")
        .upload(path, file);
      if (!uploadErr) {
        await supabase.from("trade_screenshots").insert({ trade_id: tradeId, url: path });
      }
    }

    router.push(`/trades/${tradeId}`);
  };

  const sections = ["Instrument & Price", "Journal Notes", "Emotion & Checklist", "Screenshots"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Section tabs */}
      <div className="flex gap-1 bg-[var(--card)] border border-[var(--card-border)] p-1 rounded-xl">
        {sections.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveSection(i)}
            className={cn(
              "flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-all",
              activeSection === i
                ? "bg-brand-green text-white shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Section 0: Instrument & Price */}
      {activeSection === 0 && (
        <div className="card p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Instrument *</label>
              <InstrumentSelect
                value={form.instrument}
                onChange={(symbol, type) => {
                  set("instrument", symbol);
                  set("instrument_type", type as string);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Direction *</label>
                <div className="flex gap-2">
                  {(["long", "short"] as Direction[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set("direction", d)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-semibold border transition-all",
                        form.direction === d && d === "long"
                          ? "bg-brand-green text-white border-brand-green"
                          : form.direction === d && d === "short"
                          ? "bg-brand-red text-white border-brand-red"
                          : "border-[var(--card-border)] text-[var(--muted)] hover:border-gray-400"
                      )}
                    >
                      {d === "long" ? "▲ Long" : "▼ Short"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Result</label>
                <select
                  value={form.result}
                  onChange={(e) => set("result", e.target.value)}
                  className="input-base w-full"
                >
                  <option value="open">Open</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="breakeven">Breakeven</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Entry Price *</label>
                <input
                  type="number"
                  step="any"
                  value={form.entry_price}
                  onChange={(e) => set("entry_price", e.target.value)}
                  placeholder="0.00000"
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Exit Price</label>
                <input
                  type="number"
                  step="any"
                  value={form.exit_price}
                  onChange={(e) => set("exit_price", e.target.value)}
                  placeholder="0.00000"
                  className="input-base w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Stop Loss</label>
                <input
                  type="number"
                  step="any"
                  value={form.stop_loss}
                  onChange={(e) => set("stop_loss", e.target.value)}
                  placeholder="0.00000"
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Take Profit</label>
                <input
                  type="number"
                  step="any"
                  value={form.take_profit}
                  onChange={(e) => set("take_profit", e.target.value)}
                  placeholder="0.00000"
                  className="input-base w-full"
                />
              </div>
            </div>

            {computedRR !== null && (
              <div className="flex items-center gap-2 bg-brand-green/5 border border-brand-green/20 rounded-lg p-3">
                <span className="text-xs text-[var(--muted)]">Risk:Reward Ratio</span>
                <span className="text-sm font-bold text-brand-green ml-auto">1 : {computedRR}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Lot Size</label>
                <input
                  type="number"
                  step="any"
                  value={form.lot_size}
                  onChange={(e) => set("lot_size", e.target.value)}
                  placeholder="0.01"
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Risk Amount ($)</label>
                <input
                  type="number"
                  step="any"
                  value={form.risk_amount}
                  onChange={(e) => set("risk_amount", e.target.value)}
                  placeholder="50.00"
                  className="input-base w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Entry Date *</label>
                <input
                  type="datetime-local"
                  value={form.entry_date}
                  onChange={(e) => set("entry_date", e.target.value)}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Exit Date</label>
                <input
                  type="datetime-local"
                  value={form.exit_date}
                  onChange={(e) => set("exit_date", e.target.value)}
                  className="input-base w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="breakout, london session, trend"
                className="input-base w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Journal Notes */}
      {activeSection === 1 && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Why did you enter?</label>
            <textarea
              rows={4}
              value={form.reason_for_entry}
              onChange={(e) => set("reason_for_entry", e.target.value)}
              placeholder="Describe your setup, the confluence factors, what made this trade valid..."
              className="input-base w-full resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">What happened during the trade?</label>
            <textarea
              rows={4}
              value={form.trade_narrative}
              onChange={(e) => set("trade_narrative", e.target.value)}
              placeholder="How did price move? Did it do what you expected? Any key moments..."
              className="input-base w-full resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Why did you exit?</label>
            <textarea
              rows={4}
              value={form.exit_reason}
              onChange={(e) => set("exit_reason", e.target.value)}
              placeholder="Hit take profit? Stop loss triggered? Manual exit? Why?"
              className="input-base w-full resize-none"
            />
          </div>
        </div>
      )}

      {/* Section 3: Screenshots */}
      {activeSection === 3 && (
        <div className="card p-6 space-y-4">
          <div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Add chart screenshots or trade setups. Images will be saved with the trade.
            </p>

            {/* Drop zone */}
            <label
              className={cn(
                "flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                "border-[var(--card-border)] hover:border-brand-green/50 hover:bg-brand-green/5"
              )}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).filter(
                    (f) => f.size <= 10 * 1024 * 1024
                  );
                  setSelectedFiles((prev) => [...prev, ...files]);
                  e.target.value = "";
                }}
              />
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                <ImagePlus size={20} className="text-brand-green" />
              </div>
              <p className="text-sm font-medium">Click to add screenshots</p>
              <p className="text-xs text-[var(--muted)]">PNG, JPG, GIF — max 10MB each</p>
            </label>
          </div>

          {/* Preview grid */}
          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {selectedFiles.map((file, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-[var(--card-border)] aspect-video bg-[var(--input)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-red/90 text-white hover:bg-brand-red transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black/50 px-2 py-1 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length === 0 && (
            <p className="text-center text-xs text-[var(--muted)]">No images selected yet.</p>
          )}
        </div>
      )}

      {/* Section 2: Emotion & Checklist */}
      {activeSection === 2 && (
        <div className="card p-6 space-y-6">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-3">
              How did you feel before entering?
            </label>
            <EmotionSelector
              value={form.emotional_state}
              onChange={(val) => set("emotional_state", val)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-3">Pre-Trade Checklist</label>
            <ChecklistSection
              responses={checklistResponses}
              onChange={setChecklistResponses}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {activeSection > 0 && (
            <button
              type="button"
              onClick={() => setActiveSection((s) => s - 1)}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--card-border)] hover:border-gray-400 transition-colors"
            >
              Back
            </button>
          )}
          {activeSection < sections.length - 1 && (
            <button
              type="button"
              onClick={() => setActiveSection((s) => s + 1)}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--card)] border border-[var(--card-border)] hover:border-brand-green/50 transition-colors"
            >
              Next
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white rounded-lg font-semibold text-sm hover:bg-brand-green/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : mode === "edit" ? "Update Trade" : "Save Trade"}
        </button>
      </div>
    </form>
  );
}

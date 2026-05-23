import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Trade } from "@/lib/types/trade";
import type { TradeChecklistResponse } from "@/lib/types/checklist";
import { EMOTIONS } from "@/lib/constants/emotions";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import {
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  ArrowLeft,
  CheckSquare,
  Square,
} from "lucide-react";
import { DeleteTradeButton } from "@/components/trades/DeleteTradeButton";
import { CloseTradeButton } from "@/components/trades/CloseTradeButton";
import { ScreenshotGallery } from "@/components/trades/ScreenshotGallery";

const resultStyles: Record<string, string> = {
  win: "bg-brand-green/10 text-brand-green border-brand-green/20",
  loss: "bg-brand-red/10 text-brand-red border-brand-red/20",
  breakeven: "bg-gray-100 dark:bg-white/10 text-[var(--muted)] border-transparent",
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-[var(--card-border)] last:border-0">
      <span className="text-xs text-[var(--muted)] shrink-0 w-36">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

export default async function TradePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trade } = await supabase
    .from("trades")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!trade) notFound();

  const { data: checklist } = await supabase
    .from("trade_checklist_responses")
    .select("*")
    .eq("trade_id", params.id)
    .order("position");

  const t = trade as Trade;
  const responses = (checklist ?? []) as TradeChecklistResponse[];
  const emotion = EMOTIONS.find((e) => e.value === t.emotional_state);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/trades"
          className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Trades
        </Link>
        <div className="flex items-center gap-2">
          <DeleteTradeButton tradeId={t.id} />
          {t.result === "open" && (
            <CloseTradeButton
              tradeId={t.id}
              entryPrice={t.entry_price}
              direction={t.direction}
            />
          )}
          <Link
            href={`/trades/${t.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-sm font-medium hover:border-brand-green/50 transition-colors"
          >
            <Edit size={14} />
            Edit
          </Link>
        </div>
      </div>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl",
                t.direction === "long"
                  ? "bg-brand-green/10 text-brand-green"
                  : "bg-brand-red/10 text-brand-red"
              )}
            >
              {t.direction === "long" ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.instrument}</h2>
              <p className="text-sm text-[var(--muted)] capitalize">{t.direction} · {formatDate(t.entry_date)}</p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "text-2xl font-bold",
                (t.pnl ?? 0) > 0 ? "text-brand-green" : (t.pnl ?? 0) < 0 ? "text-brand-red" : "text-[var(--muted)]"
              )}
            >
              {t.pnl != null ? formatCurrency(t.pnl) : "—"}
            </p>
            <span
              className={cn(
                "inline-block text-xs px-2 py-0.5 rounded-full border font-medium mt-1",
                resultStyles[t.result] ?? ""
              )}
            >
              {t.result.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Price details */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold mb-3">Trade Details</h3>
        <InfoRow label="Entry Price" value={t.entry_price} />
        <InfoRow label="Exit Price" value={t.exit_price} />
        <InfoRow label="Stop Loss" value={t.stop_loss} />
        <InfoRow label="Take Profit" value={t.take_profit} />
        <InfoRow label="Lot Size" value={t.lot_size} />
        <InfoRow label="Risk Amount" value={t.risk_amount != null ? formatCurrency(t.risk_amount) : null} />
        <InfoRow label="Risk:Reward" value={t.rr_ratio != null ? `1:${t.rr_ratio}` : null} />
        <InfoRow label="Entry Date" value={formatDate(t.entry_date)} />
        <InfoRow label="Exit Date" value={t.exit_date ? formatDate(t.exit_date) : null} />
        {t.tags?.length > 0 && (
          <InfoRow
            label="Tags"
            value={
              <div className="flex flex-wrap gap-1 justify-end">
                {t.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--input)] text-[var(--muted)]">
                    {tag}
                  </span>
                ))}
              </div>
            }
          />
        )}
      </div>

      {/* Emotion */}
      {emotion && (
        <div className="card p-6 flex items-center gap-3">
          <span className="text-3xl">{emotion.emoji}</span>
          <div>
            <p className="text-xs text-[var(--muted)]">Emotional state before trade</p>
            <p className="text-sm font-semibold">{emotion.label}</p>
          </div>
        </div>
      )}

      {/* Journal notes */}
      {(t.reason_for_entry || t.trade_narrative || t.exit_reason) && (
        <div className="card p-6 space-y-5">
          <h3 className="text-sm font-semibold">Journal Notes</h3>
          {t.reason_for_entry && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Why I entered</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.reason_for_entry}</p>
            </div>
          )}
          {t.trade_narrative && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">What happened</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.trade_narrative}</p>
            </div>
          )}
          {t.exit_reason && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Why I exited</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.exit_reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Checklist */}
      {responses.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-3">Pre-Trade Checklist</h3>
          <div className="space-y-2">
            {responses.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-1.5">
                {r.checked ? (
                  <CheckSquare size={16} className="text-brand-green shrink-0" />
                ) : (
                  <Square size={16} className="text-[var(--muted)] shrink-0" />
                )}
                <span className={cn("text-sm", !r.checked && "text-[var(--muted)]")}>{r.item_label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] mt-3">
            {responses.filter((r) => r.checked).length}/{responses.length} items checked
          </p>
        </div>
      )}

      {/* Screenshots */}
      <ScreenshotGallery tradeId={t.id} userId={user.id} />
    </div>
  );
}

import Link from "next/link";
import type { Trade } from "@/lib/types/trade";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";

interface TradeCardProps {
  trade: Trade;
}

const resultStyles: Record<string, string> = {
  win: "bg-brand-green/10 text-brand-green border-brand-green/20",
  loss: "bg-brand-red/10 text-brand-red border-brand-red/20",
  breakeven: "bg-gray-100 dark:bg-white/10 text-[var(--muted)] border-[var(--card-border)]",
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function TradeCard({ trade }: TradeCardProps) {
  return (
    <Link
      href={`/trades/${trade.id}`}
      className="card p-4 flex items-center gap-4 hover:border-brand-green/30 transition-all group"
    >
      {/* Direction icon */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
          trade.direction === "long"
            ? "bg-brand-green/10 text-brand-green"
            : "bg-brand-red/10 text-brand-red"
        )}
      >
        {trade.direction === "long" ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{trade.instrument}</span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-medium",
              resultStyles[trade.result] ?? resultStyles.open
            )}
          >
            {trade.result.toUpperCase()}
          </span>
          {trade.tags?.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--input)] text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)]">
          <span>{formatDate(trade.entry_date)}</span>
          <span>·</span>
          <span className="capitalize">{trade.direction}</span>
          {trade.rr_ratio && (
            <>
              <span>·</span>
              <span>RR: 1:{trade.rr_ratio}</span>
            </>
          )}
        </div>
      </div>

      {/* P&L */}
      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-sm font-bold",
            (trade.pnl ?? 0) > 0
              ? "text-brand-green"
              : (trade.pnl ?? 0) < 0
              ? "text-brand-red"
              : "text-[var(--muted)]"
          )}
        >
          {trade.pnl != null ? formatCurrency(trade.pnl) : "—"}
        </p>
        <p className="text-xs text-[var(--muted)]">
          @ {trade.entry_price}
        </p>
      </div>

      <ChevronRight size={16} className="text-[var(--muted)] group-hover:text-brand-green transition-colors shrink-0" />
    </Link>
  );
}

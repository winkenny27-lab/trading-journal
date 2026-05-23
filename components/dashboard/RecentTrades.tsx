import Link from "next/link";
import type { Trade } from "@/lib/types/trade";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const recent = trades.slice(0, 5);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Trades</h3>
        <Link href="/trades" className="text-xs text-brand-green hover:underline">
          View all
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-[var(--muted)] text-center py-8">No trades yet.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((trade) => (
            <Link
              key={trade.id}
              href={`/trades/${trade.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold",
                    trade.direction === "long"
                      ? "bg-brand-green/10 text-brand-green"
                      : "bg-brand-red/10 text-brand-red"
                  )}
                >
                  {trade.direction === "long" ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{trade.instrument}</p>
                  <p className="text-xs text-[var(--muted)]">{formatDate(trade.entry_date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    (trade.pnl ?? 0) >= 0 ? "text-brand-green" : "text-brand-red"
                  )}
                >
                  {trade.pnl != null ? formatCurrency(trade.pnl) : "—"}
                </p>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    trade.result === "win"
                      ? "bg-brand-green/10 text-brand-green"
                      : trade.result === "loss"
                      ? "bg-brand-red/10 text-brand-red"
                      : trade.result === "open"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-gray-100 dark:bg-white/10 text-[var(--muted)]"
                  )}
                >
                  {trade.result.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

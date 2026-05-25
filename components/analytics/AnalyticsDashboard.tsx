"use client";

import { useState, useMemo } from "react";
import type { Trade } from "@/lib/types/trade";
import { formatCurrency } from "@/lib/utils/formatters";
import { calcWinRate, calcTotalPnL, calcAvgRR } from "@/lib/utils/tradeStats";
import {
  calcProfitFactor,
  calcAvgWin,
  calcAvgLoss,
  calcBestTrade,
  calcWorstTrade,
  calcMonthlyPnL,
  calcPnLByDayOfWeek,
  calcStatsByInstrument,
  calcStatsByEmotion,
} from "@/lib/utils/analytics";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { WinRateChart } from "@/components/dashboard/WinRateChart";
import { MonthlyPnLChart } from "./MonthlyPnLChart";
import { DayOfWeekChart } from "./DayOfWeekChart";
import { cn } from "@/lib/utils/cn";

interface AnalyticsDashboardProps {
  trades: Trade[];
}

const DATE_RANGES = [
  { label: "All Time", days: null },
  { label: "1Y", days: 365 },
  { label: "90D", days: 90 },
  { label: "30D", days: 30 },
] as const;

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "green" | "red";
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
      <p
        className={cn(
          "text-xl font-bold",
          color === "green" && "text-brand-green",
          color === "red" && "text-brand-red"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

export function AnalyticsDashboard({ trades }: AnalyticsDashboardProps) {
  const [rangeIdx, setRangeIdx] = useState(0);

  const filtered = useMemo(() => {
    const days = DATE_RANGES[rangeIdx].days;
    if (!days) return trades;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return trades.filter((t) => new Date(t.entry_date) >= cutoff);
  }, [trades, rangeIdx]);

  const winRate = calcWinRate(filtered);
  const totalPnL = calcTotalPnL(filtered);
  const avgRR = calcAvgRR(filtered);
  const profitFactor = calcProfitFactor(filtered);
  const avgWin = calcAvgWin(filtered);
  const avgLoss = calcAvgLoss(filtered);
  const bestTrade = calcBestTrade(filtered);
  const worstTrade = calcWorstTrade(filtered);
  const monthlyData = calcMonthlyPnL(filtered);
  const dowData = calcPnLByDayOfWeek(filtered);
  const instrumentStats = calcStatsByInstrument(filtered);
  const emotionStats = calcStatsByEmotion(filtered);

  const closed = filtered.filter((t) => t.result !== "open");
  const wins = closed.filter((t) => t.result === "win").length;
  const losses = closed.filter((t) => t.result === "loss").length;

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-5xl mb-4">📊</p>
        <p className="text-lg font-semibold mb-2">No trades yet</p>
        <p className="text-sm text-[var(--muted)]">Add some trades to see your performance analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Date range filter */}
      <div className="flex items-center gap-1 bg-[var(--card)] border border-[var(--card-border)] p-1 rounded-xl w-fit">
        {DATE_RANGES.map((r, i) => (
          <button
            key={i}
            onClick={() => setRangeIdx(i)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
              rangeIdx === i
                ? "bg-brand-green text-white shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Stats row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Trades"
          value={String(filtered.length)}
          sub={`${closed.length} closed · ${filtered.length - closed.length} open`}
        />
        <StatCard
          label="Win Rate"
          value={`${winRate}%`}
          sub={`${wins}W / ${losses}L`}
          color={winRate >= 50 ? "green" : "red"}
        />
        <StatCard
          label="Total P&L"
          value={formatCurrency(totalPnL)}
          color={totalPnL > 0 ? "green" : totalPnL < 0 ? "red" : undefined}
        />
        <StatCard
          label="Profit Factor"
          value={profitFactor != null ? String(profitFactor) : "—"}
          sub="gross profit ÷ gross loss"
          color={profitFactor != null ? (profitFactor >= 1 ? "green" : "red") : undefined}
        />
      </div>

      {/* Stats row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Win" value={avgWin ? formatCurrency(avgWin) : "—"} color="green" />
        <StatCard label="Avg Loss" value={avgLoss ? formatCurrency(avgLoss) : "—"} color="red" />
        <StatCard
          label="Best Trade"
          value={bestTrade != null ? formatCurrency(bestTrade) : "—"}
          color="green"
        />
        <StatCard
          label="Worst Trade"
          value={worstTrade != null ? formatCurrency(worstTrade) : "—"}
          color="red"
        />
      </div>

      {/* Equity curve */}
      <PnLChart trades={filtered} />

      {/* Monthly P&L + Win Rate donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyPnLChart data={monthlyData} />
        </div>
        <WinRateChart trades={filtered} />
      </div>

      {/* Day of week + Instrument table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DayOfWeekChart data={dowData} />

        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4">By Instrument</h3>
          {instrumentStats.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No data.</p>
          ) : (
            <>
              <div className="grid grid-cols-4 text-xs text-[var(--muted)] mb-2 px-1">
                <span>Symbol</span>
                <span className="text-right">Trades</span>
                <span className="text-right">Win%</span>
                <span className="text-right">P&L</span>
              </div>
              {instrumentStats.map((s) => (
                <div
                  key={s.instrument}
                  className="grid grid-cols-4 text-sm py-2 px-1 border-b border-[var(--card-border)] last:border-0 items-center"
                >
                  <span className="font-medium">{s.instrument}</span>
                  <span className="text-right text-[var(--muted)]">{s.trades}</span>
                  <span
                    className={cn(
                      "text-right font-medium",
                      s.winRate >= 50 ? "text-brand-green" : "text-brand-red"
                    )}
                  >
                    {s.winRate}%
                  </span>
                  <span
                    className={cn(
                      "text-right font-medium",
                      s.totalPnL > 0 ? "text-brand-green" : s.totalPnL < 0 ? "text-brand-red" : ""
                    )}
                  >
                    {formatCurrency(s.totalPnL)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Avg R:R strip */}
      {avgRR > 0 && (
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-sm shrink-0">
            R
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Average Risk:Reward Ratio</p>
            <p className="text-lg font-bold">1:{avgRR}</p>
          </div>
        </div>
      )}

      {/* Emotion table */}
      {emotionStats.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4">Performance by Emotional State</h3>
          <div className="grid grid-cols-4 text-xs text-[var(--muted)] mb-2 px-1">
            <span>State</span>
            <span className="text-right">Trades</span>
            <span className="text-right">Win%</span>
            <span className="text-right">Total P&L</span>
          </div>
          {emotionStats.map((s) => (
            <div
              key={s.emotion}
              className="grid grid-cols-4 text-sm py-2.5 px-1 border-b border-[var(--card-border)] last:border-0 items-center"
            >
              <span className="flex items-center gap-2">
                <span>{s.emoji}</span>
                <span className="font-medium">{s.label}</span>
              </span>
              <span className="text-right text-[var(--muted)]">{s.trades}</span>
              <span
                className={cn(
                  "text-right font-medium",
                  s.winRate >= 50 ? "text-brand-green" : "text-brand-red"
                )}
              >
                {s.winRate}%
              </span>
              <span
                className={cn(
                  "text-right font-medium",
                  s.totalPnL > 0 ? "text-brand-green" : s.totalPnL < 0 ? "text-brand-red" : ""
                )}
              >
                {formatCurrency(s.totalPnL)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

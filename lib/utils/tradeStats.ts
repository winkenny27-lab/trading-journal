import type { Trade } from "@/lib/types/trade";

export function calcWinRate(trades: Trade[]): number {
  const closed = trades.filter((t) => t.result !== "open");
  if (closed.length === 0) return 0;
  const wins = closed.filter((t) => t.result === "win").length;
  return Math.round((wins / closed.length) * 100);
}

export function calcTotalPnL(trades: Trade[]): number {
  return trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
}

export function calcAvgRR(trades: Trade[]): number {
  const withRR = trades.filter((t) => t.rr_ratio != null);
  if (withRR.length === 0) return 0;
  const sum = withRR.reduce((acc, t) => acc + (t.rr_ratio ?? 0), 0);
  return Math.round((sum / withRR.length) * 100) / 100;
}

export function calcStreak(trades: Trade[]): { type: "win" | "loss" | "none"; count: number } {
  const closed = [...trades]
    .filter((t) => t.result === "win" || t.result === "loss")
    .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

  if (closed.length === 0) return { type: "none", count: 0 };

  const type = closed[0].result as "win" | "loss";
  let count = 0;
  for (const t of closed) {
    if (t.result === type) count++;
    else break;
  }
  return { type, count };
}

export function calcPnLByDay(trades: Trade[]): { date: string; pnl: number; cumulative: number }[] {
  const byDay: Record<string, number> = {};
  for (const t of trades) {
    if (t.pnl == null) continue;
    const day = t.entry_date.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + t.pnl;
  }

  const sorted = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));
  let cumulative = 0;
  return sorted.map(([date, pnl]) => {
    cumulative += pnl;
    return { date, pnl, cumulative };
  });
}

export function calcRRFromPrices(
  direction: "long" | "short",
  entry: number,
  sl: number,
  tp: number
): number | null {
  if (!entry || !sl || !tp) return null;
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return null;
  return Math.round((reward / risk) * 100) / 100;
}

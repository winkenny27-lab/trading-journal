import type { Trade } from "@/lib/types/trade";
import { EMOTIONS } from "@/lib/constants/emotions";

export interface MonthlyPnL {
  month: string;
  pnl: number;
}

export interface DayOfWeekPnL {
  day: string;
  pnl: number;
  trades: number;
}

export interface InstrumentStats {
  instrument: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
}

export interface EmotionStats {
  emotion: string;
  label: string;
  emoji: string;
  trades: number;
  winRate: number;
  totalPnL: number;
}

export function calcProfitFactor(trades: Trade[]): number | null {
  const closed = trades.filter((t) => t.result !== "open" && t.pnl != null);
  const grossProfit = closed.filter((t) => (t.pnl ?? 0) > 0).reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(closed.filter((t) => (t.pnl ?? 0) < 0).reduce((s, t) => s + (t.pnl ?? 0), 0));
  if (grossLoss === 0) return null;
  return Math.round((grossProfit / grossLoss) * 100) / 100;
}

export function calcAvgWin(trades: Trade[]): number {
  const wins = trades.filter((t) => t.result === "win" && t.pnl != null);
  if (!wins.length) return 0;
  return wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length;
}

export function calcAvgLoss(trades: Trade[]): number {
  const losses = trades.filter((t) => t.result === "loss" && t.pnl != null);
  if (!losses.length) return 0;
  return losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length;
}

export function calcBestTrade(trades: Trade[]): number | null {
  const withPnL = trades.filter((t) => t.pnl != null);
  if (!withPnL.length) return null;
  return Math.max(...withPnL.map((t) => t.pnl ?? 0));
}

export function calcWorstTrade(trades: Trade[]): number | null {
  const withPnL = trades.filter((t) => t.pnl != null);
  if (!withPnL.length) return null;
  return Math.min(...withPnL.map((t) => t.pnl ?? 0));
}

export function calcMonthlyPnL(trades: Trade[]): MonthlyPnL[] {
  const map = new Map<string, number>();
  trades.forEach((t) => {
    if (t.pnl == null) return;
    const d = new Date(t.entry_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + (t.pnl ?? 0));
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, pnl]) => {
      const [year, month] = key.split("-");
      const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      return { month: label, pnl: Math.round(pnl * 100) / 100 };
    });
}

export function calcPnLByDayOfWeek(trades: Trade[]): DayOfWeekPnL[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const map = new Map<number, { pnl: number; count: number }>();
  for (let i = 1; i <= 5; i++) map.set(i, { pnl: 0, count: 0 });
  trades.forEach((t) => {
    if (t.pnl == null) return;
    const day = new Date(t.entry_date).getDay();
    if (day < 1 || day > 5) return;
    const curr = map.get(day)!;
    map.set(day, { pnl: curr.pnl + (t.pnl ?? 0), count: curr.count + 1 });
  });
  return days.map((day, i) => {
    const d = map.get(i + 1)!;
    return { day, pnl: Math.round(d.pnl * 100) / 100, trades: d.count };
  });
}

export function calcStatsByInstrument(trades: Trade[]): InstrumentStats[] {
  const map = new Map<string, { trades: number; wins: number; losses: number; pnl: number }>();
  trades.forEach((t) => {
    if (!map.has(t.instrument)) {
      map.set(t.instrument, { trades: 0, wins: 0, losses: 0, pnl: 0 });
    }
    const s = map.get(t.instrument)!;
    s.trades++;
    if (t.result === "win") s.wins++;
    if (t.result === "loss") s.losses++;
    s.pnl += t.pnl ?? 0;
  });
  return Array.from(map.entries())
    .map(([instrument, s]) => ({
      instrument,
      trades: s.trades,
      wins: s.wins,
      losses: s.losses,
      winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0,
      totalPnL: Math.round(s.pnl * 100) / 100,
      avgPnL: Math.round((s.pnl / s.trades) * 100) / 100,
    }))
    .sort((a, b) => b.trades - a.trades);
}

export function calcStatsByEmotion(trades: Trade[]): EmotionStats[] {
  const map = new Map<string, { trades: number; wins: number; pnl: number }>();
  trades.forEach((t) => {
    if (!t.emotional_state) return;
    if (!map.has(t.emotional_state)) map.set(t.emotional_state, { trades: 0, wins: 0, pnl: 0 });
    const s = map.get(t.emotional_state)!;
    s.trades++;
    if (t.result === "win") s.wins++;
    s.pnl += t.pnl ?? 0;
  });
  return Array.from(map.entries())
    .map(([emotion, s]) => {
      const meta = EMOTIONS.find((e) => e.value === emotion);
      return {
        emotion,
        label: meta?.label ?? emotion,
        emoji: meta?.emoji ?? "",
        trades: s.trades,
        winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0,
        totalPnL: Math.round(s.pnl * 100) / 100,
      };
    })
    .sort((a, b) => b.trades - a.trades);
}

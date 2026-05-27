import type { Trade } from "@/lib/types/trade";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  emoji: string;
  category: string;
  check: (d: BadgeData) => boolean;
  getProgress: (d: BadgeData) => { current: number; total: number };
}

export interface BadgeData {
  totalTrades: number;
  closedTrades: number;
  winCount: number;
  winRate: number;
  totalPnL: number;
  currentWinStreak: number;
  longestWinStreak: number;
  journalingStreak: number;
  longestJournalingStreak: number;
  tradesWithSL: number;
  calmTrades: number;
}

export const TIER_STYLES: Record<BadgeTier, { bg: string; border: string; text: string; pill: string; label: string }> = {
  bronze:   { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-500",  pill: "bg-amber-500/20 text-amber-500",  label: "Bronze"   },
  silver:   { bg: "bg-gray-400/10",   border: "border-gray-400/30",   text: "text-gray-300",   pill: "bg-gray-400/20 text-gray-300",    label: "Silver"   },
  gold:     { bg: "bg-yellow-400/10", border: "border-yellow-400/30", text: "text-yellow-400", pill: "bg-yellow-400/20 text-yellow-400", label: "Gold"     },
  platinum: { bg: "bg-purple-400/10", border: "border-purple-400/30", text: "text-purple-400", pill: "bg-purple-400/20 text-purple-400", label: "Platinum" },
};

export const BADGES: BadgeDefinition[] = [
  // ── Milestones ──────────────────────────────────────────────────────
  {
    id: "first_trade", name: "First Step", emoji: "📝", tier: "bronze", category: "Milestones",
    description: "Log your very first trade.",
    check: (d) => d.totalTrades >= 1,
    getProgress: (d) => ({ current: Math.min(d.totalTrades, 1), total: 1 }),
  },
  {
    id: "trade_10", name: "Getting Started", emoji: "📊", tier: "bronze", category: "Milestones",
    description: "Log 10 trades.",
    check: (d) => d.totalTrades >= 10,
    getProgress: (d) => ({ current: Math.min(d.totalTrades, 10), total: 10 }),
  },
  {
    id: "trade_25", name: "Building Habits", emoji: "📈", tier: "silver", category: "Milestones",
    description: "Log 25 trades.",
    check: (d) => d.totalTrades >= 25,
    getProgress: (d) => ({ current: Math.min(d.totalTrades, 25), total: 25 }),
  },
  {
    id: "trade_50", name: "Consistent Trader", emoji: "🏆", tier: "gold", category: "Milestones",
    description: "Log 50 trades.",
    check: (d) => d.totalTrades >= 50,
    getProgress: (d) => ({ current: Math.min(d.totalTrades, 50), total: 50 }),
  },
  {
    id: "trade_100", name: "Elite Journaler", emoji: "💎", tier: "platinum", category: "Milestones",
    description: "Log 100 trades.",
    check: (d) => d.totalTrades >= 100,
    getProgress: (d) => ({ current: Math.min(d.totalTrades, 100), total: 100 }),
  },

  // ── Win Streak ───────────────────────────────────────────────────────
  {
    id: "streak_3", name: "Hot Streak", emoji: "🔥", tier: "bronze", category: "Win Streak",
    description: "Win 3 trades in a row.",
    check: (d) => d.longestWinStreak >= 3,
    getProgress: (d) => ({ current: Math.min(d.longestWinStreak, 3), total: 3 }),
  },
  {
    id: "streak_5", name: "On Fire", emoji: "🔥", tier: "silver", category: "Win Streak",
    description: "Win 5 trades in a row.",
    check: (d) => d.longestWinStreak >= 5,
    getProgress: (d) => ({ current: Math.min(d.longestWinStreak, 5), total: 5 }),
  },
  {
    id: "streak_10", name: "Unstoppable", emoji: "⚡", tier: "gold", category: "Win Streak",
    description: "Win 10 trades in a row.",
    check: (d) => d.longestWinStreak >= 10,
    getProgress: (d) => ({ current: Math.min(d.longestWinStreak, 10), total: 10 }),
  },
  {
    id: "streak_20", name: "Legend", emoji: "👑", tier: "platinum", category: "Win Streak",
    description: "Win 20 trades in a row.",
    check: (d) => d.longestWinStreak >= 20,
    getProgress: (d) => ({ current: Math.min(d.longestWinStreak, 20), total: 20 }),
  },

  // ── Profitability ────────────────────────────────────────────────────
  {
    id: "first_win", name: "First Blood", emoji: "💰", tier: "bronze", category: "Profitability",
    description: "Win your first trade.",
    check: (d) => d.winCount >= 1,
    getProgress: (d) => ({ current: Math.min(d.winCount, 1), total: 1 }),
  },
  {
    id: "profit_100", name: "$100 Club", emoji: "💵", tier: "bronze", category: "Profitability",
    description: "Reach $100 in total P&L.",
    check: (d) => d.totalPnL >= 100,
    getProgress: (d) => ({ current: Math.min(Math.max(d.totalPnL, 0), 100), total: 100 }),
  },
  {
    id: "profit_500", name: "$500 Club", emoji: "💰", tier: "silver", category: "Profitability",
    description: "Reach $500 in total P&L.",
    check: (d) => d.totalPnL >= 500,
    getProgress: (d) => ({ current: Math.min(Math.max(d.totalPnL, 0), 500), total: 500 }),
  },
  {
    id: "profit_1000", name: "$1K Club", emoji: "🤑", tier: "gold", category: "Profitability",
    description: "Reach $1,000 in total P&L.",
    check: (d) => d.totalPnL >= 1000,
    getProgress: (d) => ({ current: Math.min(Math.max(d.totalPnL, 0), 1000), total: 1000 }),
  },
  {
    id: "profit_5000", name: "$5K Club", emoji: "💎", tier: "platinum", category: "Profitability",
    description: "Reach $5,000 in total P&L.",
    check: (d) => d.totalPnL >= 5000,
    getProgress: (d) => ({ current: Math.min(Math.max(d.totalPnL, 0), 5000), total: 5000 }),
  },

  // ── Accuracy ─────────────────────────────────────────────────────────
  {
    id: "winrate_50", name: "Coin Flip Beater", emoji: "🎯", tier: "bronze", category: "Accuracy",
    description: "Achieve 50%+ win rate over at least 10 closed trades.",
    check: (d) => d.closedTrades >= 10 && d.winRate >= 50,
    getProgress: (d) => ({ current: Math.min(d.closedTrades, 10), total: 10 }),
  },
  {
    id: "winrate_60", name: "Sharp Shooter", emoji: "🏹", tier: "silver", category: "Accuracy",
    description: "Achieve 60%+ win rate over at least 10 closed trades.",
    check: (d) => d.closedTrades >= 10 && d.winRate >= 60,
    getProgress: (d) => ({ current: Math.min(d.closedTrades, 10), total: 10 }),
  },
  {
    id: "winrate_70", name: "Sniper", emoji: "🎯", tier: "gold", category: "Accuracy",
    description: "Achieve 70%+ win rate over at least 20 closed trades.",
    check: (d) => d.closedTrades >= 20 && d.winRate >= 70,
    getProgress: (d) => ({ current: Math.min(d.closedTrades, 20), total: 20 }),
  },
  {
    id: "winrate_80", name: "Market Wizard", emoji: "🧙", tier: "platinum", category: "Accuracy",
    description: "Achieve 80%+ win rate over at least 20 closed trades.",
    check: (d) => d.closedTrades >= 20 && d.winRate >= 80,
    getProgress: (d) => ({ current: Math.min(d.closedTrades, 20), total: 20 }),
  },

  // ── Discipline ───────────────────────────────────────────────────────
  {
    id: "risk_manager", name: "Risk Manager", emoji: "🛡️", tier: "bronze", category: "Discipline",
    description: "Set a stop loss on 10 trades.",
    check: (d) => d.tradesWithSL >= 10,
    getProgress: (d) => ({ current: Math.min(d.tradesWithSL, 10), total: 10 }),
  },
  {
    id: "zen_trader", name: "Zen Trader", emoji: "😌", tier: "silver", category: "Discipline",
    description: "Enter 10 trades feeling calm or confident.",
    check: (d) => d.calmTrades >= 10,
    getProgress: (d) => ({ current: Math.min(d.calmTrades, 10), total: 10 }),
  },
  {
    id: "journal_7", name: "Week Warrior", emoji: "📅", tier: "bronze", category: "Discipline",
    description: "Log trades 7 days in a row.",
    check: (d) => d.longestJournalingStreak >= 7,
    getProgress: (d) => ({ current: Math.min(d.longestJournalingStreak, 7), total: 7 }),
  },
  {
    id: "journal_30", name: "Monthly Master", emoji: "🏅", tier: "platinum", category: "Discipline",
    description: "Log trades 30 days in a row.",
    check: (d) => d.longestJournalingStreak >= 30,
    getProgress: (d) => ({ current: Math.min(d.longestJournalingStreak, 30), total: 30 }),
  },
];

export const BADGE_CATEGORIES = ["Milestones", "Win Streak", "Profitability", "Accuracy", "Discipline"];

export function computeBadgeData(trades: Trade[]): BadgeData {
  const closedTrades = trades.filter((t) => t.result !== "open");
  const winCount = trades.filter((t) => t.result === "win").length;
  const winRate = closedTrades.length > 0 ? Math.round((winCount / closedTrades.length) * 100) : 0;
  const totalPnL = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);

  // Win streak (current + longest)
  const byDate = [...trades]
    .filter((t) => t.result === "win" || t.result === "loss")
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

  let longest = 0, curr = 0;
  for (const t of byDate) {
    if (t.result === "win") { curr++; longest = Math.max(longest, curr); }
    else curr = 0;
  }

  const recent = [...byDate].reverse();
  let currentWinStreak = 0;
  if (recent.length > 0 && recent[0].result === "win") {
    for (const t of recent) {
      if (t.result === "win") currentWinStreak++;
      else break;
    }
  }

  // Journaling streak (current + longest)
  const days = Array.from(new Set(trades.map((t) => t.entry_date.slice(0, 10)))).sort();
  let journalingStreak = 0, longestJournalingStreak = 0, runJ = 0;
  for (let i = 0; i < days.length; i++) {
    if (i === 0) { runJ = 1; }
    else {
      const diff = (new Date(days[i]).getTime() - new Date(days[i - 1]).getTime()) / 86400000;
      runJ = diff === 1 ? runJ + 1 : 1;
    }
    longestJournalingStreak = Math.max(longestJournalingStreak, runJ);
  }

  if (days.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const last = days[days.length - 1];
    if (last === today || last === yesterday) {
      journalingStreak = 1;
      for (let i = days.length - 1; i > 0; i--) {
        const diff = (new Date(days[i]).getTime() - new Date(days[i - 1]).getTime()) / 86400000;
        if (diff === 1) journalingStreak++;
        else break;
      }
    }
  }

  return {
    totalTrades: trades.length,
    closedTrades: closedTrades.length,
    winCount,
    winRate,
    totalPnL,
    currentWinStreak,
    longestWinStreak: longest,
    journalingStreak,
    longestJournalingStreak,
    tradesWithSL: trades.filter((t) => t.stop_loss != null).length,
    calmTrades: trades.filter((t) => t.emotional_state === "calm" || t.emotional_state === "confident").length,
  };
}

export function getEarnedBadges(data: BadgeData): BadgeDefinition[] {
  return BADGES.filter((b) => b.check(data));
}

export function getNextBadge(data: BadgeData): { badge: BadgeDefinition; pct: number } | null {
  const unearned = BADGES.filter((b) => !b.check(data));
  if (!unearned.length) return null;
  let best = { badge: unearned[0], pct: 0 };
  for (const badge of unearned) {
    const { current, total } = badge.getProgress(data);
    const pct = total > 0 ? (current / total) * 100 : 0;
    if (pct > best.pct) best = { badge, pct };
  }
  return best;
}

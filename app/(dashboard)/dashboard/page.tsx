import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { WinRateChart } from "@/components/dashboard/WinRateChart";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { MotivationQuote } from "@/components/dashboard/MotivationQuote";
import {
  calcWinRate,
  calcTotalPnL,
  calcAvgRR,
  calcStreak,
} from "@/lib/utils/tradeStats";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { TrendingUp, DollarSign, Target, Zap } from "lucide-react";
import type { Trade } from "@/lib/types/trade";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false });

  const allTrades = (trades ?? []) as Trade[];
  const winRate = calcWinRate(allTrades);
  const totalPnL = calcTotalPnL(allTrades);
  const avgRR = calcAvgRR(allTrades);
  const streak = calcStreak(allTrades);

  const openTrades = allTrades.filter((t) => t.result === "open").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Motivation quote */}
      <MotivationQuote />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Win Rate"
          value={formatPercent(winRate)}
          subtext={`${allTrades.filter((t) => t.result === "win").length} wins`}
          icon={TrendingUp}
          accent={winRate >= 50 ? "green" : "red"}
        />
        <StatsCard
          label="Total P&L"
          value={formatCurrency(totalPnL)}
          subtext={`${allTrades.filter((t) => t.result !== "open").length} closed trades`}
          icon={DollarSign}
          accent={totalPnL >= 0 ? "green" : "red"}
        />
        <StatsCard
          label="Avg Risk:Reward"
          value={avgRR > 0 ? `1:${avgRR}` : "—"}
          subtext="Average across all trades"
          icon={Target}
          accent="neutral"
        />
        <StatsCard
          label={streak.type === "win" ? "Win Streak" : streak.type === "loss" ? "Loss Streak" : "Streak"}
          value={streak.count > 0 ? `${streak.count}` : "—"}
          subtext={`${openTrades} open trade${openTrades !== 1 ? "s" : ""}`}
          icon={Zap}
          accent={streak.type === "win" ? "green" : streak.type === "loss" ? "red" : "neutral"}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PnLChart trades={allTrades} />
        </div>
        <WinRateChart trades={allTrades} />
      </div>

      {/* Recent trades */}
      <RecentTrades trades={allTrades} />
    </div>
  );
}

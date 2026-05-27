"use client";

import Link from "next/link";
import { Flame, Calendar, Trophy, ArrowRight } from "lucide-react";
import { computeBadgeData, getEarnedBadges, getNextBadge, TIER_STYLES } from "@/lib/constants/badges";
import type { Trade } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";

export function StreakBadgePreview({ trades }: { trades: Trade[] }) {
  const data = computeBadgeData(trades);
  const earned = getEarnedBadges(data);
  const next = getNextBadge(data);
  const recentBadges = [...earned].slice(-3).reverse();

  return (
    <div className="space-y-4">
      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0">
            <Flame size={18} className="text-brand-green" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Win Streak</p>
            <p className="text-xl font-extrabold">
              {data.currentWinStreak > 0 ? `🔥 ${data.currentWinStreak}` : "—"}
            </p>
            <p className="text-xs text-[var(--muted)]">Best: {data.longestWinStreak}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0">
            <Calendar size={18} className="text-brand-green" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Journal Streak</p>
            <p className="text-xl font-extrabold">
              {data.journalingStreak > 0 ? `📅 ${data.journalingStreak}` : "—"}
              {data.journalingStreak > 0 && <span className="text-xs font-normal text-[var(--muted)] ml-1">days</span>}
            </p>
            <p className="text-xs text-[var(--muted)]">Best: {data.longestJournalingStreak}d</p>
          </div>
        </div>
      </div>

      {/* Achievements preview */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={15} className="text-brand-green" />
            <span className="text-sm font-semibold">Achievements</span>
          </div>
          <Link href="/achievements" className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-[var(--muted)]">{earned.length} / 22 badges earned</p>
          <div className="flex-1 mx-4 h-1.5 bg-[var(--input)] rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green rounded-full transition-all"
              style={{ width: `${Math.round((earned.length / 22) * 100)}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-brand-green">{Math.round((earned.length / 22) * 100)}%</p>
        </div>

        {/* Recent badges */}
        {recentBadges.length > 0 && (
          <div className="flex gap-2 mb-4">
            {recentBadges.map((b) => {
              const tier = TIER_STYLES[b.tier];
              return (
                <div key={b.id} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border flex-1", tier.bg, tier.border)}>
                  <span className="text-lg">{b.emoji}</span>
                  <div className="min-w-0">
                    <p className={cn("text-xs font-semibold truncate", tier.text)}>{b.name}</p>
                    <p className="text-[10px] text-[var(--muted)] capitalize">{b.tier}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Next badge */}
        {next && (
          <div className="bg-[var(--input)] rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-[var(--muted)] mb-1">Next badge</p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>{next.badge.emoji}</span>
                <span className="text-xs font-semibold">{next.badge.name}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", TIER_STYLES[next.badge.tier].pill)}>
                  {TIER_STYLES[next.badge.tier].label}
                </span>
              </div>
              <span className="text-xs font-bold text-brand-green">{Math.round(next.pct)}%</span>
            </div>
            <div className="mt-1.5 w-full h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full" style={{ width: `${next.pct}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

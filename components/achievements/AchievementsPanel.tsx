"use client";

import { useState } from "react";
import {
  BADGES,
  BADGE_CATEGORIES,
  TIER_STYLES,
  computeBadgeData,
  getEarnedBadges,
  type BadgeDefinition,
} from "@/lib/constants/badges";
import type { Trade } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { Trophy, Flame, Calendar } from "lucide-react";

interface AchievementsPanelProps {
  trades: Trade[];
}

function BadgeCard({ badge, earned, progress }: {
  badge: BadgeDefinition;
  earned: boolean;
  progress: { current: number; total: number };
}) {
  const tier = TIER_STYLES[badge.tier];
  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all",
      earned ? cn(tier.bg, tier.border) : "bg-[var(--card)] border-[var(--card-border)] opacity-60"
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-2xl">{badge.emoji}</span>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full",
          earned ? tier.pill : "bg-[var(--input)] text-[var(--muted)]"
        )}>
          {tier.label}
        </span>
      </div>
      <p className={cn("text-sm font-semibold mb-0.5", earned ? tier.text : "text-[var(--foreground)]")}>
        {badge.name}
      </p>
      <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">{badge.description}</p>

      {earned ? (
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", tier.text)}>
          <Trophy size={11} />
          Earned
        </div>
      ) : (
        <div>
          <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
            <span>Progress</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--input)] rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AchievementsPanel({ trades }: AchievementsPanelProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const data = computeBadgeData(trades);
  const earned = getEarnedBadges(data);
  const earnedIds = new Set(earned.map((b) => b.id));

  const categories = ["All", ...BADGE_CATEGORIES];
  const filtered = activeCategory === "All"
    ? BADGES
    : BADGES.filter((b) => b.category === activeCategory);

  const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0">
            <Flame size={20} className="text-brand-green" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Win Streak</p>
            <p className="text-2xl font-extrabold">
              {data.currentWinStreak > 0 ? `🔥 ${data.currentWinStreak}` : "—"}
            </p>
            <p className="text-xs text-[var(--muted)]">Best: {data.longestWinStreak}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0">
            <Calendar size={20} className="text-brand-green" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Journaling Streak</p>
            <p className="text-2xl font-extrabold">
              {data.journalingStreak > 0 ? `📅 ${data.journalingStreak}` : "—"}
              <span className="text-sm font-normal text-[var(--muted)] ml-1">days</span>
            </p>
            <p className="text-xs text-[var(--muted)]">Best: {data.longestJournalingStreak} days</p>
          </div>
        </div>
      </div>

      {/* Badge summary */}
      <div className="card p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Trophy size={20} className="text-brand-green" />
          <div>
            <p className="text-sm font-semibold">{earned.length} / {BADGES.length} Badges Earned</p>
            <p className="text-xs text-[var(--muted)]">{BADGES.length - earned.length} badges remaining</p>
          </div>
        </div>
        <div className="flex gap-3">
          {(["bronze", "silver", "gold", "platinum"] as const).map((tier) => {
            const count = earned.filter((b) => b.tier === tier).length;
            const total = BADGES.filter((b) => b.tier === tier).length;
            return (
              <div key={tier} className="text-center">
                <p className={cn("text-sm font-bold", TIER_STYLES[tier].text)}>{count}/{total}</p>
                <p className="text-[10px] text-[var(--muted)] capitalize">{tier}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap bg-[var(--card)] border border-[var(--card-border)] p-1 rounded-xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeCategory === cat
                ? "bg-brand-green text-white shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badge grid — earned first, then locked sorted by tier */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          ...filtered.filter((b) => earnedIds.has(b.id)).sort((a, b) => tierOrder[b.tier] - tierOrder[a.tier]),
          ...filtered.filter((b) => !earnedIds.has(b.id)).sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]),
        ].map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={earnedIds.has(badge.id)}
            progress={badge.getProgress(data)}
          />
        ))}
      </div>
    </div>
  );
}

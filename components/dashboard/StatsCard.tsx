import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  accent?: "green" | "red" | "neutral";
}

export function StatsCard({ label, value, subtext, icon: Icon, accent = "neutral" }: StatsCardProps) {
  const accentColor = {
    green: "text-brand-green",
    red: "text-brand-red",
    neutral: "text-[var(--muted)]",
  }[accent];

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">{label}</span>
        <div className={cn("p-2 rounded-lg", accent === "green" ? "bg-brand-green/10" : accent === "red" ? "bg-brand-red/10" : "bg-gray-100 dark:bg-white/5")}>
          <Icon size={16} className={accentColor} />
        </div>
      </div>
      <div>
        <p className={cn("text-2xl font-bold", accentColor)}>{value}</p>
        {subtext && <p className="text-xs text-[var(--muted)] mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

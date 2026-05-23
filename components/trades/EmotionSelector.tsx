"use client";

import { EMOTIONS } from "@/lib/constants/emotions";
import type { EmotionalState } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";

interface EmotionSelectorProps {
  value: EmotionalState | "";
  onChange: (value: EmotionalState) => void;
}

export function EmotionSelector({ value, onChange }: EmotionSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {EMOTIONS.map((e) => (
        <button
          key={e.value}
          type="button"
          onClick={() => onChange(e.value)}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs font-medium transition-all",
            value === e.value
              ? `${e.color} border-current`
              : "border-[var(--card-border)] text-[var(--muted)] hover:border-gray-400 dark:hover:border-gray-600"
          )}
        >
          <span className="text-lg">{e.emoji}</span>
          <span>{e.label}</span>
        </button>
      ))}
    </div>
  );
}

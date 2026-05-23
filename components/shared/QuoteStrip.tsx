"use client";

import { MOTIVATION_QUOTES } from "@/lib/constants/quotes";

export function QuoteStrip() {
  const doubled = [...MOTIVATION_QUOTES, ...MOTIVATION_QUOTES];
  return (
    <div className="w-full overflow-hidden bg-brand-green/5 border-y border-brand-green/20 py-2">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((q, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-8 text-sm text-brand-green/80">
            <span className="text-brand-green">✦</span>
            <span className="italic">&ldquo;{q.text}&rdquo;</span>
            <span className="text-[var(--muted)] not-italic">— {q.author}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

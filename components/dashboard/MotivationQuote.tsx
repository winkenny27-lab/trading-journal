"use client";

import { useEffect, useState } from "react";
import { MOTIVATION_QUOTES } from "@/lib/constants/quotes";
import { Quote } from "lucide-react";

export function MotivationQuote() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % MOTIVATION_QUOTES.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const quote = MOTIVATION_QUOTES[index];

  return (
    <div className="card p-6 flex gap-4 items-start">
      <Quote className="text-brand-green mt-1 shrink-0" size={20} />
      <div
        className="transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <p className="text-sm leading-relaxed italic text-[var(--foreground)]">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-xs text-[var(--muted)] mt-2">— {quote.author}</p>
      </div>
    </div>
  );
}

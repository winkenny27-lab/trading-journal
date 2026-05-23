"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

function TickerItem({ item }: { item: TickerItem }) {
  const up = item.change >= 0;
  return (
    <span className="inline-flex items-center gap-2 px-5 shrink-0">
      <span className="text-xs font-bold text-[var(--foreground)]">{item.symbol}</span>
      <span className="text-xs text-[var(--muted)]">
        {item.price < 10 ? item.price.toFixed(5) : item.price.toFixed(2)}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-xs font-semibold",
          up ? "text-brand-green" : "text-brand-red"
        )}
      >
        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {up ? "+" : ""}{item.changePercent.toFixed(2)}%
      </span>
      <span className="text-[var(--card-border)]">|</span>
    </span>
  );
}

export function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [error, setError] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrices = async () => {
    try {
      const res = await fetch("/api/ticker");
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.data?.length) {
        setItems(json.data);
        setError(false);
      }
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (error || items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-[var(--card)] border-b border-[var(--card-border)] py-2 select-none">
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: "ticker 60s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((item, i) => (
          <TickerItem key={`${item.symbol}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

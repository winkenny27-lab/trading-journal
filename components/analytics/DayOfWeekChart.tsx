"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DayOfWeekPnL } from "@/lib/utils/analytics";
import { formatCurrency } from "@/lib/utils/formatters";

export function DayOfWeekChart({ data }: { data: DayOfWeekPnL[] }) {
  const hasData = data.some((d) => d.trades > 0);

  if (!hasData) {
    return (
      <div className="card p-6 flex items-center justify-center h-52 text-[var(--muted)] text-sm">
        No data yet.
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold mb-4">P&amp;L by Day of Week</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value, name) => [
              name === "pnl" ? formatCurrency(Number(value)) : `${value} trades`,
              name === "pnl" ? "Total P&L" : "Trades",
            ]}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

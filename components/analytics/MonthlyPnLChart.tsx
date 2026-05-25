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
import type { MonthlyPnL } from "@/lib/utils/analytics";
import { formatCurrency } from "@/lib/utils/formatters";

export function MonthlyPnLChart({ data }: { data: MonthlyPnL[] }) {
  if (data.length === 0) {
    return (
      <div className="card p-6 flex items-center justify-center h-52 text-[var(--muted)] text-sm">
        No monthly data yet.
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold mb-4">Monthly P&amp;L</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
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
            formatter={(value) => [formatCurrency(Number(value)), "P&L"]}
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

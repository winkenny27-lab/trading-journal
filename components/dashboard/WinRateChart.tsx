"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Trade } from "@/lib/types/trade";

interface WinRateChartProps {
  trades: Trade[];
}

export function WinRateChart({ trades }: WinRateChartProps) {
  const closed = trades.filter((t) => t.result !== "open");
  const wins = closed.filter((t) => t.result === "win").length;
  const losses = closed.filter((t) => t.result === "loss").length;
  const breakevens = closed.filter((t) => t.result === "breakeven").length;

  const data = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
    { name: "Breakeven", value: breakevens },
  ].filter((d) => d.value > 0);

  const COLORS = ["#22c55e", "#ef4444", "#6b7280"];

  if (closed.length === 0) {
    return (
      <div className="card p-6 flex items-center justify-center h-52 text-[var(--muted)] text-sm">
        No closed trades yet.
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold mb-4">Win / Loss Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

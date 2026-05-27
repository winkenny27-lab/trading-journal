import type { Trade } from "@/lib/types/trade";

function escapeCSV(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportTradesToCSV(trades: Trade[]): string {
  const headers = [
    "Date", "Instrument", "Instrument Type", "Direction",
    "Entry Price", "Exit Price", "Stop Loss", "Take Profit",
    "Lot Size", "Risk Amount", "P&L", "R:R", "Result",
    "Entry Date", "Exit Date", "Emotional State", "Tags",
    "Reason for Entry", "Trade Narrative", "Exit Reason",
  ];

  const rows = trades.map((t) => [
    t.entry_date.slice(0, 10),
    t.instrument,
    t.instrument_type,
    t.direction,
    t.entry_price ?? "",
    t.exit_price ?? "",
    t.stop_loss ?? "",
    t.take_profit ?? "",
    t.lot_size ?? "",
    t.risk_amount ?? "",
    t.pnl ?? "",
    t.rr_ratio ?? "",
    t.result,
    t.entry_date,
    t.exit_date ?? "",
    t.emotional_state ?? "",
    (t.tags ?? []).join(";"),
    t.reason_for_entry ?? "",
    t.trade_narrative ?? "",
    t.exit_reason ?? "",
  ]);

  const lines = [
    headers.map(escapeCSV).join(","),
    ...rows.map((r) => r.map(escapeCSV).join(",")),
  ];

  return lines.join("\n");
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

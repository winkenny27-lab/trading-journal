"use client";

import { Download } from "lucide-react";
import { exportTradesToCSV, downloadCSV } from "@/lib/utils/csvExport";
import type { Trade } from "@/lib/types/trade";

export function ExportButton({ trades }: { trades: Trade[] }) {
  function handleExport() {
    const csv = exportTradesToCSV(trades);
    const date = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `tradelog-export-${date}.csv`);
  }

  return (
    <button
      onClick={handleExport}
      disabled={trades.length === 0}
      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--card-border)] hover:border-brand-green/50 hover:text-brand-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download size={14} />
      Export CSV
    </button>
  );
}

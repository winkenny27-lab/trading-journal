import type { Trade } from "@/lib/types/trade";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(parseCSVLine);
  return { headers, rows };
}

function detectFormat(headers: string[]): "tradelog" | "mt4" | "mt5" | "generic" {
  const h = headers.map((s) => s.toLowerCase());
  if (h.includes("instrument") && h.includes("direction") && h.includes("entry price")) return "tradelog";
  if (h.includes("symbol") && h.includes("open price") && h.includes("close price") && h.includes("type")) {
    if (h.some((s) => s.includes("magic"))) return "mt4";
    return "mt5";
  }
  return "generic";
}

function inferResult(pnl: number | null | undefined): "win" | "loss" | "breakeven" {
  if (pnl == null) return "breakeven";
  if (pnl > 0) return "win";
  if (pnl < 0) return "loss";
  return "breakeven";
}

function num(v: string | undefined): number | undefined {
  if (v == null || v === "") return undefined;
  const n = parseFloat(v.replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? undefined : n;
}

function toISO(v: string | undefined): string {
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function mapTradeLogRow(headers: string[], row: string[], userId: string): Partial<Trade> {
  const get = (col: string) => {
    const idx = headers.findIndex((h) => h.toLowerCase() === col.toLowerCase());
    return idx >= 0 ? row[idx] : undefined;
  };

  const pnl = num(get("P&L"));
  const resultRaw = get("Result")?.toLowerCase();
  const result: Trade["result"] =
    resultRaw === "win" || resultRaw === "loss" || resultRaw === "breakeven" || resultRaw === "open"
      ? (resultRaw as Trade["result"])
      : inferResult(pnl);

  return {
    user_id: userId,
    instrument: get("Instrument") ?? "Unknown",
    instrument_type: (get("Instrument Type") as Trade["instrument_type"]) ?? "forex_major",
    direction: (get("Direction") as Trade["direction"]) ?? "long",
    entry_price: num(get("Entry Price")),
    exit_price: num(get("Exit Price")),
    stop_loss: num(get("Stop Loss")),
    take_profit: num(get("Take Profit")),
    lot_size: num(get("Lot Size")),
    risk_amount: num(get("Risk Amount")),
    pnl,
    rr_ratio: num(get("R:R")),
    result,
    entry_date: toISO(get("Entry Date") ?? get("Date")),
    exit_date: get("Exit Date") ? toISO(get("Exit Date")) : null,
    emotional_state: (get("Emotional State") as Trade["emotional_state"]) ?? null,
    tags: get("Tags") ? get("Tags")!.split(";").filter(Boolean) : [],
    reason_for_entry: get("Reason for Entry") ?? null,
    trade_narrative: get("Trade Narrative") ?? null,
    exit_reason: get("Exit Reason") ?? null,
  };
}

function mapMT4Row(headers: string[], row: string[], userId: string): Partial<Trade> {
  const get = (col: string) => {
    const idx = headers.findIndex((h) => h.toLowerCase() === col.toLowerCase());
    return idx >= 0 ? row[idx] : undefined;
  };

  const typeRaw = get("Type")?.toLowerCase() ?? "";
  const direction: Trade["direction"] = typeRaw.includes("sell") ? "short" : "long";
  const pnl = num(get("Profit") ?? get("P&L"));

  return {
    user_id: userId,
    instrument: get("Symbol") ?? "Unknown",
    instrument_type: "forex_major",
    direction,
    entry_price: num(get("Open Price")),
    exit_price: num(get("Close Price")),
    stop_loss: num(get("S/L") ?? get("Stop Loss")),
    take_profit: num(get("T/P") ?? get("Take Profit")),
    lot_size: num(get("Volume") ?? get("Size")),
    risk_amount: undefined,
    pnl,
    rr_ratio: undefined,
    result: inferResult(pnl),
    entry_date: toISO(get("Open Time")),
    exit_date: get("Close Time") ? toISO(get("Close Time")) : null,
    emotional_state: null,
    tags: [],
    reason_for_entry: get("Comment") ?? null,
    trade_narrative: null,
    exit_reason: null,
  };
}

function mapMT5Row(headers: string[], row: string[], userId: string): Partial<Trade> {
  return mapMT4Row(headers, row, userId);
}

export interface ImportResult {
  format: "tradelog" | "mt4" | "mt5" | "generic";
  trades: Partial<Trade>[];
  errors: string[];
}

export function parseImportCSV(text: string, userId: string): ImportResult {
  const { headers, rows } = parseCSV(text);
  const errors: string[] = [];

  if (headers.length === 0) {
    return { format: "generic", trades: [], errors: ["File appears to be empty or unreadable."] };
  }

  const format = detectFormat(headers);
  const trades: Partial<Trade>[] = [];

  rows.forEach((row, i) => {
    if (row.every((c) => c === "")) return;
    try {
      let trade: Partial<Trade>;
      if (format === "tradelog") trade = mapTradeLogRow(headers, row, userId);
      else if (format === "mt4") trade = mapMT4Row(headers, row, userId);
      else if (format === "mt5") trade = mapMT5Row(headers, row, userId);
      else trade = mapMT4Row(headers, row, userId);
      trades.push(trade);
    } catch {
      errors.push(`Row ${i + 2}: failed to parse`);
    }
  });

  return { format, trades, errors };
}

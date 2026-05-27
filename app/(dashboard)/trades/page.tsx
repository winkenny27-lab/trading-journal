import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TradeCard } from "@/components/trades/TradeCard";
import { ExportButton } from "@/components/trades/ExportButton";
import type { Trade, TradeResult, InstrumentType } from "@/lib/types/trade";
import { PlusCircle, Search, Upload } from "lucide-react";

interface SearchParams {
  result?: string;
  type?: string;
  q?: string;
}

export default async function TradesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false });

  if (searchParams.result && searchParams.result !== "all") {
    query = query.eq("result", searchParams.result as TradeResult);
  }
  if (searchParams.type && searchParams.type !== "all") {
    query = query.eq("instrument_type", searchParams.type as InstrumentType);
  }
  if (searchParams.q) {
    query = query.ilike("instrument", `%${searchParams.q}%`);
  }

  const { data: trades } = await query;
  const allTrades = (trades ?? []) as Trade[];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-[var(--muted)]">{allTrades.length} trade{allTrades.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          <ExportButton trades={allTrades} />
          <Link
            href="/import"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--card-border)] hover:border-brand-green/50 hover:text-brand-green transition-colors"
          >
            <Upload size={14} />
            Import
          </Link>
          <Link
            href="/trades/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-semibold hover:bg-brand-green/90 transition-colors"
          >
            <PlusCircle size={15} />
            New Trade
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search instrument..."
            className="input-base w-full pl-8"
          />
        </div>
        <select name="result" defaultValue={searchParams.result ?? "all"} className="input-base">
          <option value="all">All Results</option>
          <option value="win">Wins</option>
          <option value="loss">Losses</option>
          <option value="breakeven">Breakeven</option>
          <option value="open">Open</option>
        </select>
        <select name="type" defaultValue={searchParams.type ?? "all"} className="input-base">
          <option value="all">All Types</option>
          <option value="forex_major">Forex Majors</option>
          <option value="forex_exotic">Forex Exotics</option>
          <option value="index">Indices</option>
          <option value="stock">Stocks</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-lg text-sm hover:border-brand-green/50 transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Trade list */}
      {allTrades.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📊</p>
          <p className="text-sm text-[var(--muted)]">No trades found.</p>
          <Link href="/trades/new" className="text-brand-green text-sm hover:underline">
            Log your first trade →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allTrades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}

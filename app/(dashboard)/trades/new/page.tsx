import { TradeForm } from "@/components/trades/TradeForm";

export default function NewTradePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-sm text-[var(--muted)] mb-6">
        Fill in the details below to log a new trade.
      </p>
      <TradeForm mode="new" />
    </div>
  );
}

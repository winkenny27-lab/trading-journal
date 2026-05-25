"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/formatters";
import { Calculator, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";

const RR_LEVELS = [1, 2, 3];

function InputRow({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = "any",
  min,
  max,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">{label}</label>
      <div className="flex items-center input-base px-0 overflow-hidden">
        {prefix && (
          <span className="px-3 text-sm text-[var(--muted)] border-r border-[var(--card-border)] select-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
        />
        {suffix && (
          <span className="px-3 text-sm text-[var(--muted)] border-l border-[var(--card-border)] select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function RiskCalculator() {
  const router = useRouter();

  const [balance, setBalance] = useState("10000");
  const [riskPct, setRiskPct] = useState("1");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  // Persist account settings in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("riskCalc");
    if (saved) {
      try {
        const { balance: b, riskPct: r } = JSON.parse(saved);
        if (b) setBalance(b);
        if (r) setRiskPct(r);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("riskCalc", JSON.stringify({ balance, riskPct }));
  }, [balance, riskPct]);

  const calc = useMemo(() => {
    const bal = parseFloat(balance);
    const pct = parseFloat(riskPct);
    const entryNum = parseFloat(entry);
    const slNum = parseFloat(stopLoss);

    if (!bal || !pct || !entryNum || !slNum) return null;

    const riskAmount = bal * (pct / 100);
    const stopDist = Math.abs(entryNum - slNum);
    if (stopDist === 0) return null;

    // Validate direction
    if (direction === "long" && slNum >= entryNum) return null;
    if (direction === "short" && slNum <= entryNum) return null;

    const positionSize = riskAmount / stopDist;

    const targets = RR_LEVELS.map((rr) => {
      const tpDist = stopDist * rr;
      const tpPrice =
        direction === "long" ? entryNum + tpDist : entryNum - tpDist;
      const potentialProfit = positionSize * tpDist;
      return { rr, tpPrice, potentialProfit };
    });

    return { riskAmount, stopDist, positionSize, targets };
  }, [balance, riskPct, direction, entry, stopLoss]);

  const handleUseInTrade = () => {
    const params = new URLSearchParams();
    if (entry) params.set("entry", entry);
    if (stopLoss) params.set("sl", stopLoss);
    if (calc) params.set("tp", calc.targets[1].tpPrice.toFixed(5)); // 1:2 as default TP
    params.set("direction", direction);
    if (calc) params.set("lot", calc.positionSize.toFixed(2));
    router.push(`/trades/new?${params.toString()}`);
  };

  const riskPctNum = parseFloat(riskPct) || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Account settings */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Calculator size={15} className="text-brand-green" />
          Account Settings
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InputRow
            label="Account Balance"
            value={balance}
            onChange={setBalance}
            prefix="$"
            placeholder="10000"
            step="1"
            min="0"
          />
          <InputRow
            label="Risk Per Trade"
            value={riskPct}
            onChange={setRiskPct}
            suffix="%"
            placeholder="1"
            step="0.1"
            min="0.1"
            max="100"
          />
        </div>

        {/* Risk % slider */}
        <div>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={Math.min(parseFloat(riskPct) || 1, 5)}
            onChange={(e) => setRiskPct(e.target.value)}
            className="w-full accent-brand-green"
          />
          <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
            <span>0.1%</span>
            <span className={cn(riskPctNum > 3 ? "text-brand-red font-semibold" : "text-brand-green font-semibold")}>
              {riskPct}% risk
            </span>
            <span>5%</span>
          </div>
          {riskPctNum > 2 && (
            <p className="text-xs text-brand-red mt-1">
              ⚠️ Risking over 2% per trade significantly increases drawdown risk.
            </p>
          )}
        </div>
      </div>

      {/* Trade setup */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold">Trade Setup</h3>

        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Direction</label>
          <div className="flex gap-2">
            {(["long", "short"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold border transition-all flex items-center justify-center gap-2",
                  direction === d && d === "long"
                    ? "bg-brand-green text-white border-brand-green"
                    : direction === d && d === "short"
                    ? "bg-brand-red text-white border-brand-red"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:border-gray-400"
                )}
              >
                {d === "long" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                {d === "long" ? "Long" : "Short"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputRow
            label="Entry Price"
            value={entry}
            onChange={setEntry}
            placeholder="0.00000"
          />
          <InputRow
            label={`Stop Loss ${direction === "long" ? "(below entry)" : "(above entry)"}`}
            value={stopLoss}
            onChange={setStopLoss}
            placeholder="0.00000"
          />
        </div>

        {/* Direction validation hint */}
        {entry && stopLoss && (
          (() => {
            const e = parseFloat(entry);
            const s = parseFloat(stopLoss);
            const invalid =
              (direction === "long" && s >= e) ||
              (direction === "short" && s <= e);
            return invalid ? (
              <p className="text-xs text-brand-red">
                ⚠️ Stop loss must be {direction === "long" ? "below" : "above"} entry for a {direction} trade.
              </p>
            ) : null;
          })()
        )}
      </div>

      {/* Results */}
      {calc ? (
        <div className="card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-brand-green">Results</h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4 text-center">
              <p className="text-xs text-[var(--muted)] mb-1">Risk Amount</p>
              <p className="text-lg font-bold text-brand-green">{formatCurrency(calc.riskAmount)}</p>
            </div>
            <div className="bg-[var(--input)] rounded-xl p-4 text-center">
              <p className="text-xs text-[var(--muted)] mb-1">Stop Distance</p>
              <p className="text-lg font-bold">{calc.stopDist.toFixed(5)}</p>
            </div>
            <div className="bg-[var(--input)] rounded-xl p-4 text-center">
              <p className="text-xs text-[var(--muted)] mb-1">Position Size</p>
              <p className="text-lg font-bold">{calc.positionSize.toFixed(2)}</p>
              <p className="text-xs text-[var(--muted)]">units</p>
            </div>
          </div>

          {/* R:R targets */}
          <div>
            <p className="text-xs font-medium text-[var(--muted)] mb-2">Take Profit Targets</p>
            <div className="space-y-0">
              <div className="grid grid-cols-3 text-xs text-[var(--muted)] px-3 mb-1">
                <span>R:R Ratio</span>
                <span className="text-right">TP Price</span>
                <span className="text-right">Potential Profit</span>
              </div>
              {calc.targets.map(({ rr, tpPrice, potentialProfit }) => (
                <div
                  key={rr}
                  className="grid grid-cols-3 items-center px-3 py-3 rounded-lg border border-[var(--card-border)] mb-2 last:mb-0"
                >
                  <span className="text-sm font-semibold">
                    1:{rr}
                    {rr === 2 && (
                      <span className="ml-1.5 text-xs bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded-full">
                        recommended
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-right font-mono">{tpPrice.toFixed(5)}</span>
                  <span className="text-sm text-right font-semibold text-brand-green">
                    {formatCurrency(potentialProfit)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Use in trade button */}
          <button
            onClick={handleUseInTrade}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-green text-white rounded-lg font-semibold text-sm hover:bg-brand-green/90 transition-colors"
          >
            <ExternalLink size={15} />
            Use in New Trade
          </button>
          <p className="text-xs text-center text-[var(--muted)]">
            Pre-fills entry, stop loss, and 1:2 take profit in the trade form.
          </p>
        </div>
      ) : (
        <div className="card p-6 flex flex-col items-center justify-center py-12 text-center gap-2">
          <Calculator size={32} className="text-[var(--muted)] mb-2" />
          <p className="text-sm font-medium">Enter your trade details above</p>
          <p className="text-xs text-[var(--muted)]">
            Fill in entry price and stop loss to see your position size and take profit targets.
          </p>
        </div>
      )}
    </div>
  );
}

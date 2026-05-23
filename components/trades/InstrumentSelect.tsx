"use client";

import { INSTRUMENT_GROUPS } from "@/lib/constants/instruments";
import type { InstrumentType } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";

interface InstrumentSelectProps {
  value: string;
  onChange: (symbol: string, type: InstrumentType) => void;
  className?: string;
}

export function InstrumentSelect({ value, onChange, className }: InstrumentSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const option = e.target.options[e.target.selectedIndex];
        const type = option.dataset.type as InstrumentType;
        onChange(e.target.value, type);
      }}
      className={cn("input-base w-full", className)}
    >
      <option value="">Select instrument...</option>
      {INSTRUMENT_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.instruments.map((inst) => (
            <option key={inst.symbol} value={inst.symbol} data-type={inst.type}>
              {inst.symbol} — {inst.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

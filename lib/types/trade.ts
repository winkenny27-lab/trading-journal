export type Direction = "long" | "short";
export type TradeResult = "win" | "loss" | "breakeven" | "open";
export type InstrumentType = "forex_major" | "forex_exotic" | "index" | "stock";
export type EmotionalState =
  | "calm"
  | "confident"
  | "anxious"
  | "fearful"
  | "greedy"
  | "neutral"
  | "excited"
  | "frustrated";

export interface Trade {
  id: string;
  user_id: string;
  instrument: string;
  instrument_type: InstrumentType;
  direction: Direction;
  entry_price: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  exit_price?: number | null;
  lot_size?: number | null;
  risk_amount?: number | null;
  pnl?: number | null;
  rr_ratio?: number | null;
  result: TradeResult;
  entry_date: string;
  exit_date?: string | null;
  reason_for_entry?: string | null;
  trade_narrative?: string | null;
  exit_reason?: string | null;
  emotional_state?: EmotionalState | null;
  screenshot_url?: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TradeFormData {
  instrument: string;
  instrument_type: InstrumentType;
  direction: Direction;
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  exit_price: string;
  lot_size: string;
  risk_amount: string;
  result: TradeResult;
  entry_date: string;
  exit_date: string;
  reason_for_entry: string;
  trade_narrative: string;
  exit_reason: string;
  emotional_state: EmotionalState | "";
  tags: string;
}

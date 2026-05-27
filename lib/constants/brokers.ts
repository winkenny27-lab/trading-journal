export interface BrokerOption {
  value: string;
  label: string;
  emoji: string;
  importFormat: "mt4" | "mt5" | "tradelog" | "generic" | null;
}

export const BROKERS: BrokerOption[] = [
  { value: "mt4",                label: "MetaTrader 4 (MT4)",       emoji: "📊", importFormat: "mt4"       },
  { value: "mt5",                label: "MetaTrader 5 (MT5)",       emoji: "📊", importFormat: "mt5"       },
  { value: "ctrader",            label: "cTrader",                  emoji: "📈", importFormat: "generic"   },
  { value: "interactive_brokers",label: "Interactive Brokers",      emoji: "🏦", importFormat: "generic"   },
  { value: "td_ameritrade",      label: "TD Ameritrade",            emoji: "🏦", importFormat: "generic"   },
  { value: "robinhood",          label: "Robinhood",                emoji: "🪶", importFormat: "generic"   },
  { value: "binance",            label: "Binance",                  emoji: "🟡", importFormat: "generic"   },
  { value: "coinbase",           label: "Coinbase",                 emoji: "🔵", importFormat: "generic"   },
  { value: "oanda",              label: "OANDA",                    emoji: "🌐", importFormat: "generic"   },
  { value: "etoro",              label: "eToro",                    emoji: "🟢", importFormat: "generic"   },
  { value: "other",              label: "Other",                    emoji: "🏦", importFormat: "generic"   },
];

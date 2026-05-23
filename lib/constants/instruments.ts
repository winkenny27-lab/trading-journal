export interface Instrument {
  symbol: string;
  name: string;
  type: "forex_major" | "forex_exotic" | "index" | "stock";
}

export const FOREX_MAJORS: Instrument[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", type: "forex_major" },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", type: "forex_major" },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", type: "forex_major" },
  { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", type: "forex_major" },
  { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", type: "forex_major" },
  { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", type: "forex_major" },
  { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", type: "forex_major" },
];

export const FOREX_EXOTICS: Instrument[] = [
  { symbol: "USD/TRY", name: "US Dollar / Turkish Lira", type: "forex_exotic" },
  { symbol: "USD/ZAR", name: "US Dollar / South African Rand", type: "forex_exotic" },
  { symbol: "USD/MXN", name: "US Dollar / Mexican Peso", type: "forex_exotic" },
  { symbol: "USD/SGD", name: "US Dollar / Singapore Dollar", type: "forex_exotic" },
  { symbol: "USD/HKD", name: "US Dollar / Hong Kong Dollar", type: "forex_exotic" },
  { symbol: "USD/NOK", name: "US Dollar / Norwegian Krone", type: "forex_exotic" },
  { symbol: "USD/SEK", name: "US Dollar / Swedish Krona", type: "forex_exotic" },
  { symbol: "USD/DKK", name: "US Dollar / Danish Krone", type: "forex_exotic" },
  { symbol: "EUR/TRY", name: "Euro / Turkish Lira", type: "forex_exotic" },
  { symbol: "GBP/JPY", name: "British Pound / Japanese Yen", type: "forex_exotic" },
  { symbol: "EUR/AUD", name: "Euro / Australian Dollar", type: "forex_exotic" },
  { symbol: "EUR/CAD", name: "Euro / Canadian Dollar", type: "forex_exotic" },
  { symbol: "AUD/JPY", name: "Australian Dollar / Japanese Yen", type: "forex_exotic" },
  { symbol: "NZD/JPY", name: "New Zealand Dollar / Japanese Yen", type: "forex_exotic" },
  { symbol: "USD/BRL", name: "US Dollar / Brazilian Real", type: "forex_exotic" },
];

export const INDICES: Instrument[] = [
  { symbol: "SPX500", name: "S&P 500", type: "index" },
  { symbol: "NAS100", name: "NASDAQ 100", type: "index" },
  { symbol: "DJ30", name: "Dow Jones 30", type: "index" },
  { symbol: "DAX40", name: "Germany DAX 40", type: "index" },
  { symbol: "FTSE100", name: "UK FTSE 100", type: "index" },
  { symbol: "NKY225", name: "Nikkei 225", type: "index" },
  { symbol: "CAC40", name: "France CAC 40", type: "index" },
  { symbol: "ASX200", name: "Australia ASX 200", type: "index" },
  { symbol: "HSI", name: "Hang Seng Index", type: "index" },
  { symbol: "VIX", name: "Volatility Index", type: "index" },
];

export const STOCKS: Instrument[] = [
  { symbol: "AAPL", name: "Apple Inc.", type: "stock" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "stock" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "stock" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "stock" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "stock" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "stock" },
  { symbol: "META", name: "Meta Platforms Inc.", type: "stock" },
  { symbol: "NFLX", name: "Netflix Inc.", type: "stock" },
  { symbol: "AMD", name: "Advanced Micro Devices", type: "stock" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", type: "stock" },
  { symbol: "BAC", name: "Bank of America Corp.", type: "stock" },
  { symbol: "GS", name: "Goldman Sachs Group", type: "stock" },
  { symbol: "V", name: "Visa Inc.", type: "stock" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", type: "stock" },
  { symbol: "WMT", name: "Walmart Inc.", type: "stock" },
];

export const ALL_INSTRUMENTS = [
  ...FOREX_MAJORS,
  ...FOREX_EXOTICS,
  ...INDICES,
  ...STOCKS,
];

export const INSTRUMENT_GROUPS = [
  { label: "Forex Majors", instruments: FOREX_MAJORS },
  { label: "Forex Exotics", instruments: FOREX_EXOTICS },
  { label: "Indices", instruments: INDICES },
  { label: "Stocks", instruments: STOCKS },
];

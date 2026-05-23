import { NextResponse } from "next/server";

const FOREX_PAIRS = [
  { symbol: "EURUSD", base: "EUR", quote: "USD" },
  { symbol: "GBPUSD", base: "GBP", quote: "USD" },
  { symbol: "USDJPY", base: "USD", quote: "JPY" },
  { symbol: "AUDUSD", base: "AUD", quote: "USD" },
  { symbol: "USDCHF", base: "USD", quote: "CHF" },
  { symbol: "USDCAD", base: "USD", quote: "CAD" },
  { symbol: "NZDUSD", base: "NZD", quote: "USD" },
];

// Approximate base prices for indices/stocks (updated periodically in real app)
const STATIC_INSTRUMENTS = [
  { symbol: "SPX500", name: "S&P 500", basePrice: 5300 },
  { symbol: "NAS100", name: "NASDAQ", basePrice: 18500 },
  { symbol: "DJ30", name: "Dow Jones", basePrice: 39000 },
  { symbol: "FTSE100", name: "FTSE 100", basePrice: 8200 },
  { symbol: "DAX40", name: "DAX 40", basePrice: 18200 },
  { symbol: "AAPL", name: "Apple", basePrice: 195 },
  { symbol: "TSLA", name: "Tesla", basePrice: 175 },
  { symbol: "NVDA", name: "NVIDIA", basePrice: 875 },
  { symbol: "MSFT", name: "Microsoft", basePrice: 415 },
  { symbol: "AMZN", name: "Amazon", basePrice: 185 },
  { symbol: "GOOGL", name: "Alphabet", basePrice: 175 },
  { symbol: "META", name: "Meta", basePrice: 490 },
];

function simulatePrice(base: number, seed: number) {
  // Deterministic variation based on current minute so it looks live but is stable per 30s
  const minute = Math.floor(Date.now() / 30000);
  const rand = Math.sin(seed * 127.1 + minute * 311.7) * 0.5 + 0.5;
  const changePct = (rand - 0.5) * 2; // -1% to +1%
  const price = base * (1 + changePct / 100);
  const change = base * (changePct / 100);
  return { price, change, changePercent: changePct };
}

export async function GET() {
  try {
    // Fetch real forex data from open.er-api.com (free, no key needed)
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 60 },
    });

    const forexData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];

    if (res.ok) {
      const json = await res.json();
      const rates = json.rates ?? {};

      FOREX_PAIRS.forEach((pair, i) => {
        let price: number;
        if (pair.base === "USD") {
          price = rates[pair.quote] ?? 1;
        } else {
          price = rates[pair.base] ? 1 / rates[pair.base] : 1;
        }
        const { change, changePercent } = simulatePrice(price, i + 1);
        forexData.push({ symbol: pair.symbol, name: pair.symbol, price, change, changePercent });
      });
    }

    // Simulate realistic index/stock prices
    const staticData = STATIC_INSTRUMENTS.map((inst, i) => {
      const { price, change, changePercent } = simulatePrice(inst.basePrice, i + 10);
      return { symbol: inst.symbol, name: inst.name, price, change, changePercent };
    });

    const data = [...forexData, ...staticData];
    return NextResponse.json({ data, updatedAt: new Date().toISOString() });
  } catch {
    // Fallback: all simulated
    const data = STATIC_INSTRUMENTS.map((inst, i) => {
      const { price, change, changePercent } = simulatePrice(inst.basePrice, i + 10);
      return { symbol: inst.symbol, name: inst.name, price, change, changePercent };
    });
    return NextResponse.json({ data, updatedAt: new Date().toISOString() });
  }
}

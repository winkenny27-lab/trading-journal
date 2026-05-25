import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  BarChart2,
  BookOpen,
  Calculator,
  CheckSquare,
  ImageIcon,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp size={20} className="text-[#22c55e]" />
            <span className="font-bold text-lg tracking-tight">TradeLog</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#22c55e] text-black px-4 py-1.5 rounded-lg hover:bg-[#22c55e]/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Zap size={12} />
              Built for serious traders
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-5 tracking-tight">
              Track Every Trade.
              <br />
              <span className="text-[#22c55e]">Master Your Edge.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
              TradeLog is the all-in-one trading journal for serious traders. Log trades, analyse
              performance, and build the discipline to become consistently profitable.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="flex items-center gap-2 bg-[#22c55e] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#22c55e]/90 transition-colors text-sm"
              >
                Start for Free
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 border border-white/10 text-gray-300 font-medium px-6 py-3 rounded-xl hover:border-white/25 transition-colors text-sm"
              >
                Sign In
              </Link>
            </div>
            <p className="text-xs text-gray-600 mt-4">No credit card required. Free forever.</p>
          </div>

          {/* Dashboard mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#22c55e]/10 blur-3xl rounded-full -z-10" />
            <div className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden shadow-2xl">
              {/* Fake browser bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0d0d0d]">
                <div className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-[#22c55e]" />
                  <span className="text-xs font-semibold text-gray-300">TradeLog — Dashboard</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/60" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2.5 p-4">
                {[
                  { label: "Win Rate", value: "68%", green: true },
                  { label: "Total P&L", value: "+$4,284", green: true },
                  { label: "Streak", value: "🔥 5", green: false },
                ].map((s) => (
                  <div key={s.label} className="bg-[#0a0a0a] rounded-lg p-3">
                    <p className="text-[10px] text-gray-600 mb-1">{s.label}</p>
                    <p className={`text-base font-bold ${s.green ? "text-[#22c55e]" : "text-white"}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart bars */}
              <div className="px-4 pb-3">
                <div className="bg-[#0a0a0a] rounded-lg p-3">
                  <p className="text-[10px] text-gray-600 mb-2">Monthly P&L</p>
                  <div className="flex items-end gap-1 h-10">
                    {[45, 70, 35, 85, 60, 90, 55, 78, 40, 95, 65, 80].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-sm ${h > 50 ? "bg-[#22c55e]/60" : "bg-[#ef4444]/60"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Trade rows */}
              <div className="px-4 pb-4 space-y-1.5">
                {[
                  { pair: "EUR/USD", dir: "Long", pnl: "+$240", result: "WIN", win: true },
                  { pair: "GBP/USD", dir: "Short", pnl: "-$80", result: "LOSS", win: false },
                  { pair: "BTC/USD", dir: "Long", pnl: "+$520", result: "WIN", win: true },
                ].map((t) => (
                  <div
                    key={t.pair}
                    className="flex items-center justify-between bg-[#0a0a0a] rounded-lg px-3 py-2"
                  >
                    <span className="text-xs font-semibold">{t.pair}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        t.dir === "Long"
                          ? "bg-[#22c55e]/15 text-[#22c55e]"
                          : "bg-[#ef4444]/15 text-[#ef4444]"
                      }`}
                    >
                      {t.dir}
                    </span>
                    <span
                      className={`text-xs font-bold ${t.win ? "text-[#22c55e]" : "text-[#ef4444]"}`}
                    >
                      {t.pnl}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${t.win ? "text-[#22c55e]" : "text-[#ef4444]"}`}
                    >
                      {t.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything a serious trader needs</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Stop using spreadsheets. TradeLog gives you professional-grade tools to track and improve
              your trading — all in one clean app.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BarChart2,
                title: "Performance Analytics",
                desc: "Deep insights into your win rate, profit factor, P&L by instrument, day of week, and emotional state.",
              },
              {
                icon: BookOpen,
                title: "Trade Journal",
                desc: "Log every trade with entry, exit, emotions, reason, narrative and screenshots. Never forget a setup again.",
              },
              {
                icon: Calculator,
                title: "Risk Calculator",
                desc: "Calculate position sizes and 1:1, 1:2, 1:3 take profit targets before entering any trade.",
              },
              {
                icon: CheckSquare,
                title: "Pre-Trade Checklists",
                desc: "Build custom checklists and enforce your rules before every trade. Discipline is the edge.",
              },
              {
                icon: Zap,
                title: "Live Market Ticker",
                desc: "Real-time forex, crypto, and stock prices scrolling across every page so you never lose context.",
              },
              {
                icon: ImageIcon,
                title: "Screenshot Gallery",
                desc: "Attach chart screenshots to each trade. Review your setups and learn from what you see.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#22c55e]/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center mb-4 group-hover:bg-[#22c55e]/20 transition-colors">
                  <Icon size={18} className="text-[#22c55e]" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-gray-400">Three steps to trading with intention.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-gradient-to-r from-transparent via-[#22c55e]/30 to-transparent" />
            {[
              {
                step: "01",
                title: "Log your trade",
                desc: "Enter your instrument, direction, entry/exit prices, stop loss, emotional state, and notes.",
              },
              {
                step: "02",
                title: "Review your analytics",
                desc: "See your win rate, P&L trends, best instruments, and how your emotions affect your results.",
              },
              {
                step: "03",
                title: "Improve your edge",
                desc: "Identify your best setups, worst habits, and make data-driven decisions to grow your account.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#22c55e] font-bold text-sm">{step}</span>
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Simple, honest pricing</h2>
            <p className="text-gray-400">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-7">
              <p className="text-sm font-semibold text-gray-400 mb-1">Free</p>
              <p className="text-4xl font-extrabold mb-1">$0</p>
              <p className="text-sm text-gray-500 mb-6">Forever free</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Up to 20 trades / month",
                  "Trade journal & log",
                  "Basic dashboard",
                  "Pre-trade checklists",
                  "Light & dark mode",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check size={14} className="text-[#22c55e] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center text-sm font-semibold border border-white/10 py-2.5 rounded-xl hover:border-white/25 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#111] border border-[#22c55e]/30 rounded-2xl p-7 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#22c55e] text-black text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <p className="text-sm font-semibold text-[#22c55e] mb-1">Pro</p>
              <p className="text-4xl font-extrabold mb-1">
                $9<span className="text-xl font-medium text-gray-400">/mo</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">Billed monthly</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited trades",
                  "Everything in Free",
                  "Performance analytics",
                  "Risk calculator",
                  "Screenshot gallery",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check size={14} className="text-[#22c55e] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center text-sm font-bold bg-[#22c55e] text-black py-2.5 rounded-xl hover:bg-[#22c55e]/90 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
            Ready to trade with purpose?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join traders who are building discipline, tracking their edge, and growing their accounts
            with TradeLog.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#22c55e] text-black font-bold px-8 py-3.5 rounded-xl hover:bg-[#22c55e]/90 transition-colors"
          >
            Create Your Free Account
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-gray-600 mt-4">No credit card required. Takes 30 seconds.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#22c55e]" />
            <span className="font-bold text-sm">TradeLog</span>
          </div>
          <p className="text-xs text-gray-600">© 2026 TradeLog. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/login" className="hover:text-gray-400 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-gray-400 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

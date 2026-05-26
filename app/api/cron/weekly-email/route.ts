import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { buildWeeklyEmailHtml } from "@/lib/utils/emailTemplate";
import { calcWinRate, calcTotalPnL } from "@/lib/utils/tradeStats";
import { calcBestTrade } from "@/lib/utils/analytics";
import type { Trade } from "@/lib/types/trade";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelogapp.com";

export async function POST(req: Request) {
  // Verify cron secret so only authorized callers can trigger this
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();

  // Fetch all profiles that opted into weekly emails
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, timezone")
    .eq("weekly_email", true);

  if (error || !profiles) {
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const weekStartStr = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const weekEndStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  let sent = 0;
  let failed = 0;

  for (const profile of profiles) {
    try {
      // Fetch this user's trades from the past 7 days
      const { data: trades } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", profile.id)
        .gte("entry_date", weekStart.toISOString())
        .order("entry_date", { ascending: false });

      const weekTrades = (trades ?? []) as Trade[];

      const html = buildWeeklyEmailHtml({
        displayName: profile.display_name ?? "",
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        totalTrades: weekTrades.length,
        winRate: calcWinRate(weekTrades),
        totalPnL: calcTotalPnL(weekTrades),
        bestTrade: calcBestTrade(weekTrades),
        appUrl: APP_URL,
      });

      await sendEmail({
        to: profile.email,
        subject: `Your weekly trading report — ${weekStartStr}`,
        html,
      });

      sent++;
    } catch (err) {
      console.error(`Failed to send email to ${profile.email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: profiles.length });
}

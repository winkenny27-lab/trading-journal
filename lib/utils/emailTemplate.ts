function statBox(label: string, value: string, color = "#f9fafb") {
  return `
    <td style="width:25%;padding:8px;">
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;color:#6b7280;">${label}</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:${color};">${value}</p>
      </div>
    </td>`;
}

export function buildWeeklyEmailHtml({
  displayName,
  weekStart,
  weekEnd,
  totalTrades,
  winRate,
  totalPnL,
  bestTrade,
  worstTrade,
  appUrl,
}: {
  displayName: string;
  weekStart: string;
  weekEnd: string;
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  bestTrade: number | null;
  appUrl: string;
}) {
  const pnlColor = totalPnL > 0 ? "#22c55e" : totalPnL < 0 ? "#ef4444" : "#f9fafb";
  const pnlStr = totalPnL > 0 ? `+$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`;
  const winColor = winRate >= 50 ? "#22c55e" : "#ef4444";

  const noTrades = totalTrades === 0;

  const motivationalLine = noTrades
    ? "No trades this week — the market will be there next week. Stay sharp and stick to your plan."
    : winRate >= 60
    ? "Excellent week! Your discipline is paying off. Keep following your process."
    : winRate >= 50
    ? "Solid week. Consistent execution is the foundation of long-term profitability."
    : "Tough week, but every loss is a lesson. Review your journal and come back stronger.";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Your Weekly Trading Report</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#111;border:1px solid #1f1f1f;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:20px;font-weight:800;color:#f9fafb;">
                <span style="color:#22c55e;">▲</span> TradeLog
              </p>
              <p style="margin:0;font-size:13px;color:#6b7280;">Weekly Performance Report</p>
            </td>
          </tr>

          <!-- Week range -->
          <tr>
            <td style="background:#111;border-left:1px solid #1f1f1f;border-right:1px solid #1f1f1f;padding:20px 32px 0;">
              <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">
                ${weekStart} — ${weekEnd}
              </p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#f9fafb;text-align:center;">
                Hey ${displayName || "Trader"} 👋
              </h1>
              <p style="margin:8px 0 0;font-size:14px;color:#9ca3af;text-align:center;">
                ${noTrades ? "You had no trades logged this week." : `Here's how your week went.`}
              </p>
            </td>
          </tr>

          <!-- Stats -->
          ${!noTrades ? `
          <tr>
            <td style="background:#111;border-left:1px solid #1f1f1f;border-right:1px solid #1f1f1f;padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${statBox("Trades Taken", String(totalTrades))}
                  ${statBox("Win Rate", `${winRate}%`, winColor)}
                  ${statBox("Total P&L", pnlStr, pnlColor)}
                  ${statBox("Best Trade", bestTrade != null ? `+$${bestTrade.toFixed(2)}` : "—", "#22c55e")}
                </tr>
              </table>
            </td>
          </tr>` : ""}

          <!-- Motivational message -->
          <tr>
            <td style="background:#111;border-left:1px solid #1f1f1f;border-right:1px solid #1f1f1f;padding:${noTrades ? "20px" : "4px"} 32px 24px;">
              <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-left:3px solid #22c55e;border-radius:8px;padding:16px 20px;">
                <p style="margin:0;font-size:13px;color:#d1d5db;line-height:1.6;">${motivationalLine}</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#111;border-left:1px solid #1f1f1f;border-right:1px solid #1f1f1f;padding:0 32px 28px;text-align:center;">
              <a href="${appUrl}/analytics"
                style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
                View Full Analytics →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d0d;border:1px solid #1f1f1f;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#4b5563;">
                You're receiving this because you opted in to weekly reports in TradeLog Settings.
              </p>
              <p style="margin:0;font-size:12px;color:#4b5563;">
                <a href="${appUrl}/settings" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="${appUrl}" style="color:#6b7280;text-decoration:underline;">mytradelogapp.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

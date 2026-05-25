import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: "TradeLog — Track Every Trade. Master Your Edge.",
  description:
    "TradeLog is the all-in-one trading journal for serious traders. Log trades, analyse performance with deep analytics, and build the discipline to become consistently profitable.",
  keywords: "trading journal, trade tracker, forex journal, stock journal, trading analytics, risk calculator",
  openGraph: {
    title: "TradeLog — Track Every Trade. Master Your Edge.",
    description:
      "Log trades, analyse performance, and build the discipline to become consistently profitable.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.toggle('dark', t === 'dark');
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

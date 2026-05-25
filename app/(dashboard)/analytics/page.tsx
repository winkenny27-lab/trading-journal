import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Trade } from "@/lib/types/trade";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: true });

  return <AnalyticsDashboard trades={(trades ?? []) as Trade[]} />;
}

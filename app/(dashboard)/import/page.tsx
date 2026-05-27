import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TradeImportPage } from "@/components/broker/TradeImportPage";

export default async function ImportPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <TradeImportPage userId={user.id} />;
}

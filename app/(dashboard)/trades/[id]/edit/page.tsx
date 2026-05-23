import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TradeForm } from "@/components/trades/TradeForm";
import type { Trade } from "@/lib/types/trade";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditTradePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trade } = await supabase
    .from("trades")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!trade) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/trades/${params.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Back to Trade
      </Link>
      <TradeForm mode="edit" initialData={trade as Trade} />
    </div>
  );
}

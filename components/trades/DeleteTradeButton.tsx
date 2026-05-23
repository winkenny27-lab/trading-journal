"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteTradeButton({ tradeId }: { tradeId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("trade_checklist_responses").delete().eq("trade_id", tradeId);
    await supabase.from("trades").delete().eq("id", tradeId);
    router.push("/trades");
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--muted)]">Delete this trade?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-red text-white rounded-lg text-sm font-semibold hover:bg-brand-red/90 disabled:opacity-50 transition-colors"
        >
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          {deleting ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 text-sm rounded-lg border border-[var(--card-border)] hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-4 py-2 text-brand-red border border-brand-red/30 rounded-lg text-sm font-medium hover:bg-brand-red/10 transition-colors"
    >
      <Trash2 size={14} />
      Delete
    </button>
  );
}

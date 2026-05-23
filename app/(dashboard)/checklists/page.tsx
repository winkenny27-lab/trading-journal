"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChecklistBuilder } from "@/components/checklists/ChecklistBuilder";
import type { ChecklistTemplate } from "@/lib/types/checklist";

export default function ChecklistsPage() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);

  const fetchTemplates = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("checklist_templates")
      .select("*, items:checklist_items(*)")
      .order("created_at", { ascending: true });
    setTemplates((data as ChecklistTemplate[]) ?? []);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-sm text-[var(--muted)] mb-6">
        Build reusable pre-trade checklists. The default checklist auto-loads when you log a new trade.
      </p>
      <ChecklistBuilder templates={templates} onRefresh={fetchTemplates} />
    </div>
  );
}

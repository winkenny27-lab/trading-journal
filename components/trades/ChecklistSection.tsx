"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem, ChecklistTemplate } from "@/lib/types/checklist";

import { CheckSquare, Square } from "lucide-react";

export interface ChecklistResponse {
  item_label: string;
  checked: boolean;
  position: number;
  template_id: string;
}

interface ChecklistSectionProps {
  responses: ChecklistResponse[];
  onChange: (responses: ChecklistResponse[]) => void;
}

export function ChecklistSection({ responses, onChange }: ChecklistSectionProps) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("checklist_templates")
      .select("*, items:checklist_items(*)")
      .order("is_default", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setTemplates(data as ChecklistTemplate[]);
          const def = data.find((t: ChecklistTemplate) => t.is_default);
          if (def) {
            const sorted = [...(def.items ?? [])].sort((a: ChecklistItem, b: ChecklistItem) => a.position - b.position);
            setItems(sorted);
            setSelectedTemplate(def.id);
            onChange(
              sorted.map((item: ChecklistItem) => ({
                item_label: item.label,
                checked: false,
                position: item.position,
                template_id: def.id,
              }))
            );
          }
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTemplate = (template: ChecklistTemplate) => {
    setSelectedTemplate(template.id);
    const sorted = [...(template.items ?? [])].sort((a, b) => a.position - b.position);
    setItems(sorted);
    onChange(
      sorted.map((item) => ({
        item_label: item.label,
        checked: false,
        position: item.position,
        template_id: template.id,
      }))
    );
  };

  const toggle = (index: number) => {
    const updated = responses.map((r, i) => (i === index ? { ...r, checked: !r.checked } : r));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {templates.length > 0 && (
        <select
          value={selectedTemplate}
          onChange={(e) => {
            const t = templates.find((t) => t.id === e.target.value);
            if (t) loadTemplate(t);
          }}
          className="input-base w-full"
        >
          <option value="">Select a checklist template...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} {t.is_default ? "(Default)" : ""}
            </option>
          ))}
        </select>
      )}

      {items.length === 0 && (
        <p className="text-sm text-[var(--muted)]">
          No checklist loaded. Create one in the{" "}
          <a href="/checklists" className="text-brand-green hover:underline">
            Checklists
          </a>{" "}
          page.
        </p>
      )}

      {items.map((item, i) => {
        const response = responses[i];
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(i)}
            className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-[var(--card-border)] hover:border-brand-green/40 transition-colors"
          >
            {response?.checked ? (
              <CheckSquare size={18} className="text-brand-green shrink-0" />
            ) : (
              <Square size={18} className="text-[var(--muted)] shrink-0" />
            )}
            <span className={`text-sm ${response?.checked ? "line-through text-[var(--muted)]" : ""}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

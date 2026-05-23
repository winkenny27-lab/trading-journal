"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistTemplate } from "@/lib/types/checklist";
import { Plus, Trash2, GripVertical, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ChecklistBuilderProps {
  templates: ChecklistTemplate[];
  onRefresh: () => void;
}

export function ChecklistBuilder({ templates, onRefresh }: ChecklistBuilderProps) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  const createTemplate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("checklist_templates").insert({
      user_id: user.id,
      name: newName.trim(),
      is_default: templates.length === 0,
    });
    setNewName("");
    setCreating(false);
    onRefresh();
  };

  const deleteTemplate = async (id: string) => {
    const supabase = createClient();
    await supabase.from("checklist_templates").delete().eq("id", id);
    if (editingId === id) setEditingId(null);
    onRefresh();
  };

  const setDefault = async (id: string) => {
    const supabase = createClient();
    for (const t of templates) {
      await supabase.from("checklist_templates").update({ is_default: t.id === id }).eq("id", t.id);
    }
    onRefresh();
  };

  const addItem = async (templateId: string) => {
    if (!newItemLabel.trim()) return;
    setAddingItem(true);
    const supabase = createClient();
    const template = templates.find((t) => t.id === templateId);
    const nextPos = (template?.items?.length ?? 0);
    await supabase.from("checklist_items").insert({
      template_id: templateId,
      label: newItemLabel.trim(),
      position: nextPos,
    });
    setNewItemLabel("");
    setAddingItem(false);
    onRefresh();
  };

  const deleteItem = async (itemId: string) => {
    const supabase = createClient();
    await supabase.from("checklist_items").delete().eq("id", itemId);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Create new template */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-3">Create New Checklist</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTemplate()}
            placeholder="e.g. Pre-Trade Checklist"
            className="input-base flex-1"
          />
          <button
            onClick={createTemplate}
            disabled={creating || !newName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-brand-green/90 transition-colors"
          >
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Create
          </button>
        </div>
      </div>

      {templates.length === 0 && (
        <p className="text-center text-sm text-[var(--muted)] py-8">
          No checklists yet. Create one above.
        </p>
      )}

      {/* Template list */}
      {templates.map((template) => (
        <div key={template.id} className="card overflow-hidden">
          {/* Template header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDefault(template.id)}
                title="Set as default"
                className={cn(
                  "transition-colors",
                  template.is_default ? "text-yellow-400" : "text-[var(--muted)] hover:text-yellow-400"
                )}
              >
                <Star size={16} fill={template.is_default ? "currentColor" : "none"} />
              </button>
              <span className="font-medium text-sm">{template.name}</span>
              {template.is_default && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-500">Default</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingId(editingId === template.id ? null : template.id)}
                className="text-xs text-brand-green hover:underline"
              >
                {editingId === template.id ? "Done" : "Edit"}
              </button>
              <button
                onClick={() => deleteTemplate(template.id)}
                className="text-[var(--muted)] hover:text-brand-red transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-[var(--card-border)]">
            {(template.items ?? [])
              .sort((a, b) => a.position - b.position)
              .map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <GripVertical size={14} className="text-[var(--muted)] shrink-0" />
                  <span className="text-sm flex-1">{item.label}</span>
                  {editingId === template.id && (
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-[var(--muted)] hover:text-brand-red transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* Add item */}
          {editingId === template.id && (
            <div className="flex gap-2 px-5 py-3 border-t border-[var(--card-border)] bg-[var(--input)]/30">
              <input
                type="text"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem(template.id)}
                placeholder="Add checklist item..."
                className="input-base flex-1 text-sm"
              />
              <button
                onClick={() => addItem(template.id)}
                disabled={addingItem || !newItemLabel.trim()}
                className="flex items-center gap-1 px-3 py-2 bg-brand-green text-white rounded-lg text-sm disabled:opacity-50 hover:bg-brand-green/90 transition-colors"
              >
                {addingItem ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Add
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

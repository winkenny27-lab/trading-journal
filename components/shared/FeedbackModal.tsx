"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquarePlus, X, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Category = "bug" | "feature" | "general" | "compliment";

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "compliment", label: "Compliment", emoji: "🌟" },
  { value: "general", label: "General", emoji: "💬" },
  { value: "feature", label: "Feature Request", emoji: "💡" },
  { value: "bug", label: "Bug Report", emoji: "🐛" },
];

export function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [category, setCategory] = useState<Category>("general");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRating(0);
    setHovered(0);
    setCategory("general");
    setMessage("");
    setError(null);
    setSubmitted(false);
  };

  const handleOpen = () => { reset(); setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!message.trim()) { setError("Please enter a message."); return; }
    if (rating === 0) { setError("Please select a star rating."); return; }

    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error: err } = await supabase.from("feedback").insert({
      user_id: user?.id ?? null,
      rating,
      category,
      message: message.trim(),
    });

    setSaving(false);

    if (err) {
      setError(err.message);
    } else {
      setSubmitted(true);
      setTimeout(() => setOpen(false), 2500);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        aria-label="Leave feedback"
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
          "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
        )}
      >
        <MessageSquarePlus size={18} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative card w-full max-w-md shadow-2xl p-6 space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base">Share Your Feedback</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Help us improve TradeLog</p>
              </div>
              <button
                onClick={handleClose}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-4xl">🙏</p>
                <p className="font-semibold">Thank you for your feedback!</p>
                <p className="text-sm text-[var(--muted)]">We appreciate you taking the time to help us improve.</p>
              </div>
            ) : (
              <>
                {/* Star rating */}
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-2">
                    How would you rate TradeLog?
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={28}
                          className={cn(
                            "transition-colors",
                            star <= (hovered || rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-[var(--card-border)]"
                          )}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-[var(--muted)] self-center">
                        {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                          category === c.value
                            ? "border-brand-green bg-brand-green/10 text-brand-green"
                            : "border-[var(--card-border)] text-[var(--muted)] hover:border-gray-400"
                        )}
                      >
                        <span>{c.emoji}</span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                    Your message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you think, what's working well, or what could be better..."
                    className="input-base w-full resize-none"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1 text-right">{message.length}/500</p>
                </div>

                {error && (
                  <p className="text-xs text-brand-red bg-brand-red/10 border border-brand-red/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 text-sm rounded-lg border border-[var(--card-border)] hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-green text-white rounded-lg text-sm font-semibold hover:bg-brand-green/90 disabled:opacity-50 transition-colors"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <MessageSquarePlus size={14} />}
                    {saving ? "Sending..." : "Send Feedback"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types/user";
import { Loader2, Save, Crown } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(data as Profile);
            setDisplayName(data.display_name ?? "");
            setTimezone(data.timezone ?? "UTC");
          }
        });
    });
  }, [router]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ display_name: displayName, timezone, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-brand-green" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Profile</h2>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Email</label>
          <input type="email" value={profile.email} disabled className="input-base w-full opacity-50 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="input-base w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="input-base w-full"
          >
            {[
              "UTC", "America/New_York", "America/Chicago", "America/Denver",
              "America/Los_Angeles", "Europe/London", "Europe/Paris",
              "Europe/Berlin", "Asia/Tokyo", "Asia/Singapore",
              "Australia/Sydney", "Asia/Dubai",
            ].map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white rounded-lg text-sm font-semibold hover:bg-brand-green/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Plan */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Crown size={16} className={profile.plan === "pro" ? "text-yellow-400" : "text-[var(--muted)]"} />
          <h2 className="text-sm font-semibold">Subscription</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium capitalize">{profile.plan} Plan</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {profile.plan === "free"
                ? "Free plan — up to 50 trades"
                : "Pro plan — unlimited trades + advanced analytics"}
            </p>
          </div>
          {profile.plan === "free" && (
            <button
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
              onClick={() => alert("Stripe integration coming soon!")}
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

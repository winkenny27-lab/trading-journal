"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, Loader2 } from "lucide-react";
import { QuoteStrip } from "@/components/shared/QuoteStrip";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <QuoteStrip />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <TrendingUp className="text-brand-green" size={28} />
            <span className="font-bold text-2xl tracking-tight">TradeLog</span>
          </div>

          <div className="card p-8">
            {success ? (
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-lg font-bold mb-2">Account created!</h2>
                <p className="text-sm text-[var(--muted)]">
                  Check your email to confirm your account, then sign in.
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold mb-1">Create your account</h1>
                <p className="text-sm text-[var(--muted)] mb-6">Start your trading journal today</p>

                <form onSubmit={handleRegister} className="space-y-4">
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
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="trader@example.com"
                      className="input-base w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      className="input-base w-full"
                    />
                  </div>

                  {error && (
                    <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-green text-white rounded-lg font-semibold text-sm hover:bg-brand-green/90 disabled:opacity-50 transition-colors"
                  >
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </form>

                <p className="text-sm text-center text-[var(--muted)] mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-brand-green hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "/admin";

  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace(nextPath);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="email"
        id="admin-email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm outline-none focus:border-creme/40"
        required
      />

      <input
        type="password"
        id="admin-password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm outline-none focus:border-creme/40"
        required
      />

      {error && <div className="text-sm text-red-300">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold hover:bg-primary hover:text-creme transition-colors disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-primary/30 border border-primary/20 backdrop-blur-md p-8 rounded-sm shadow-2xl">
        <h1 className="font-serif text-3xl mb-2">Admin Login</h1>
        <p className="text-ash text-sm mb-8">Sign in to manage products.</p>

        <Suspense fallback={<div className="text-ash text-sm">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

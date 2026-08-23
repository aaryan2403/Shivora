"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "This password reset link is invalid or has expired. Please request a new one."
        );
      }

      setCheckingSession(false);
    };

    void checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    window.setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-obsidian text-creme flex items-center justify-center px-6">
        <p className="text-ash text-sm">Checking reset link...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian text-creme flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-ash/10 bg-obsidian/80 p-8 md:p-12 shadow-2xl">

        <div className="text-center mb-8">
          <p className="text-[9px] uppercase tracking-[0.35em] text-primary mb-3">
            Shivora
          </p>

          <h1 className="font-cinzel text-3xl mb-3">
            Reset Password
          </h1>

          <p className="text-sm text-ash">
            Choose a new password for your Shivora account.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-4 py-3">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center">
            <CheckCircle2
              size={34}
              className="mx-auto mb-4 text-emerald-400"
            />

            <p className="text-emerald-400 text-sm mb-2">
              Password updated successfully.
            </p>

            <p className="text-xs text-ash">
              Taking you back to Shivora...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleResetPassword}
            className="space-y-4"
          >
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ash"
              />

              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="w-full bg-ash/5 border border-ash/10 py-3 pl-12 pr-4 text-sm text-creme placeholder:text-ash/50 outline-none focus:border-creme/50 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ash"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="w-full bg-ash/5 border border-ash/10 py-3 pl-12 pr-4 text-sm text-creme placeholder:text-ash/50 outline-none focus:border-creme/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold hover:bg-primary hover:text-creme transition-all duration-300 disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, User, ArrowRight, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreds, setShowCreds] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCreds(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("shivora_user", JSON.stringify({ name: "Admin", email: "shivoraadmin@gmail.com" }));
      router.replace(nextPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div className="relative bg-obsidian/60 border border-primary/20 backdrop-blur-xl p-10 rounded-sm shadow-2xl overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-ash/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl text-creme tracking-wide">Admin Portal</h1>
              <p className="text-ash text-[10px] uppercase tracking-[0.25em]">Shivora Management</p>
            </div>
          </motion.div>

          <form onSubmit={onSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="text-[10px] uppercase tracking-[0.2em] text-ash mb-2 block">Username</label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash/60" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-obsidian/40 border border-ash/20 pl-10 pr-4 py-3 text-sm text-creme outline-none focus:border-primary/50 focus:bg-obsidian/60 transition-all duration-300 placeholder:text-ash/40"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-[10px] uppercase tracking-[0.2em] text-ash mb-2 block">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-obsidian/40 border border-ash/20 pl-10 pr-4 py-3 text-sm text-creme outline-none focus:border-primary/50 focus:bg-obsidian/60 transition-all duration-300 placeholder:text-ash/40"
                  required
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-3"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full"
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <AnimatePresence>
            {showCreds && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-8 pt-6 border-t border-ash/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={12} className="text-primary" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-primary">Demo Credentials</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/5 border border-primary/10 px-3 py-2">
                    <div className="text-[9px] uppercase tracking-wider text-ash mb-1">Username</div>
                    <div className="text-sm text-creme font-mono">admin</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 px-3 py-2">
                    <div className="text-[9px] uppercase tracking-wider text-ash mb-1">Password</div>
                    <div className="text-sm text-creme font-mono">shivora2024</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e3b388' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <Suspense fallback={
        <div className="text-ash text-sm flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-ash/30 border-t-creme rounded-full"
          />
          Loading...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}

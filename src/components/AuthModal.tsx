"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  User,
} from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register" | "forgot";

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen } = useShop();

  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const changeMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearMessages();
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearMessages();
    setLoading(true);

    const supabase = createClient();

    try {
      /* ───────── LOGIN ───────── */
if (mode === "login") {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    return;
  }

  // ShopContext detects the successful login
  // and automatically continues to checkout if needed.
  setIsAuthOpen(false);
  return;
}
      /* ───────── REGISTER ───────── */

      if (mode === "register") {
        if (!name.trim()) {
          setError("Please enter your name.");
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        setSuccessMessage(
          "Account created. Check your email to confirm your Shivora account."
        );

        return;
      }

      /* ───────── FORGOT PASSWORD ───────── */

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          setError(error.message);
          return;
        }

        setSuccessMessage(
          "Password reset email sent. Check your inbox for the reset link."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearMessages();

    const supabase = createClient();

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAuthOpen(false);
      }
    },
    [setIsAuthOpen]
  );

  useEffect(() => {
    if (!isAuthOpen) return;

    clearMessages();

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isAuthOpen, handleEscape]);

  const title =
    mode === "login"
      ? "Welcome Back"
      : mode === "register"
      ? "Join Shivora"
      : "Reset Password";

  const description =
    mode === "login"
      ? "Access your wishlist, preferences and account."
      : mode === "register"
      ? "Create your Shivora account and save your favourites."
      : "Enter your email and we'll send you a password reset link.";

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <>
          {/* BACKDROP */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-[150]"
            onClick={() => setIsAuthOpen(false)}
          />

          {/* MODAL */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              type: "spring",
              duration: 0.5,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-md max-h-[90vh] overflow-y-auto bg-obsidian border border-ash/10 z-[160] p-7 md:p-12 shadow-2xl rounded-sm"
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setIsAuthOpen(false)}
              aria-label="Close authentication"
              className="absolute top-4 right-4 text-ash cursor-pointer hover:text-creme transition-colors duration-200"
            >
              <X size={20} />
            </button>

            {/* TITLE */}

            <div className="text-center mb-8">
              <p className="text-[9px] uppercase tracking-[0.35em] text-primary mb-3">
                Shivora
              </p>

              <h2
                id="auth-title"
                className="font-cinzel text-3xl mb-3 text-creme"
              >
                {title}
              </h2>

              <p className="text-ash text-sm font-medium leading-relaxed">
                {description}
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-4 flex items-start gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-sm">
                <AlertCircle
                  size={14}
                  className="mt-0.5 flex-shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS */}

            {successMessage && (
              <div className="mb-4 text-emerald-400 text-xs bg-emerald-400/10 border border-emerald-400/20 px-4 py-3 rounded-sm leading-relaxed">
                {successMessage}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              <div className="space-y-4">

                {/* NAME — REGISTER ONLY */}

                {mode === "register" && (
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-ash"
                    />

                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-ash/5 border border-ash/10 py-3 pl-12 pr-4 text-sm text-creme placeholder:text-ash/50 outline-none focus:border-creme/50 transition-colors"
                      required
                    />
                  </div>
                )}

                {/* EMAIL */}

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-ash"
                  />

                  <input
                    type="email"
                    id="auth-email"
                    name="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-ash/5 border border-ash/10 py-3 pl-12 pr-4 text-sm text-creme placeholder:text-ash/50 outline-none focus:border-creme/50 transition-colors"
                    required
                  />
                </div>

                {/* PASSWORD */}

                {mode !== "forgot" && (
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-ash"
                    />

                    <input
                      type="password"
                      id="auth-password"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-ash/5 border border-ash/10 py-3 pl-12 pr-4 text-sm text-creme placeholder:text-ash/50 outline-none focus:border-creme/50 transition-colors"
                      required
                      minLength={6}
                    />
                  </div>
                )}

                {/* CONFIRM PASSWORD */}

                {mode === "register" && (
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-ash"
                    />

                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      className="w-full bg-ash/5 border border-ash/10 py-3 pl-12 pr-4 text-sm text-creme placeholder:text-ash/50 outline-none focus:border-creme/50 transition-colors"
                      required
                      minLength={6}
                    />
                  </div>
                )}
              </div>

              {/* FORGOT PASSWORD LINK */}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => changeMode("forgot")}
                  className="self-end text-[11px] text-ash hover:text-creme transition-colors"
                >
                  Forgot password?
                </button>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold cursor-pointer hover:bg-primary hover:text-creme transition-all duration-300 flex justify-center items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Sign In"
                  : mode === "register"
                  ? "Create Account"
                  : "Send Reset Link"}

                {!loading && (
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                )}
              </button>
            </form>

            {/* GOOGLE */}

            {mode !== "forgot" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ash/10" />
                  </div>

                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                    <span className="bg-obsidian px-3 text-ash">
                      or
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-3.5 bg-white text-gray-800 tracking-[0.15em] uppercase text-xs font-semibold cursor-pointer hover:bg-gray-50 transition-all duration-300 flex justify-center items-center gap-3 border border-gray-200"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />

                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />

                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />

                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>

                  Continue with Google
                </button>
              </>
            )}

            {/* BOTTOM SWITCH */}

            <div className="mt-8 text-center flex flex-col gap-3">

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => changeMode("register")}
                  className="text-ash text-xs tracking-wider hover:text-creme transition-all duration-200"
                >
                  Don't have an account?{" "}
                  <span className="text-primary">
                    Create Account
                  </span>
                </button>
              )}

              {mode === "register" && (
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className="text-ash text-xs tracking-wider hover:text-creme transition-all duration-200"
                >
                  Already have an account?{" "}
                  <span className="text-primary">
                    Sign In
                  </span>
                </button>
              )}

              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className="text-ash text-xs tracking-wider hover:text-creme transition-all duration-200"
                >
                  ← Back to Sign In
                </button>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

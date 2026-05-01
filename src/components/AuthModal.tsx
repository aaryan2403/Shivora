"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, ArrowRight } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useState, useEffect, useCallback } from "react";

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, login } = useShop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    if (email) {
      login(email);
      setIsAuthOpen(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Simulate Google login
    const googleEmail = `user${Math.floor(Math.random() * 10000)}@gmail.com`;
    login(googleEmail);
    setIsAuthOpen(false);
  };

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setIsAuthOpen(false);
  }, [setIsAuthOpen]);

  useEffect(() => {
    if (isAuthOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isAuthOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-[150]"
            onClick={() => setIsAuthOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-obsidian border border-ash/10 z-[160] p-8 md:p-12 shadow-2xl rounded-sm"
          >
            <button 
              type="button"
              onClick={() => setIsAuthOpen(false)}
              aria-label="Close authentication"
              className="absolute top-4 right-4 text-ash cursor-pointer hover:text-creme transition-colors duration-200"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-10">
              <h2 id="auth-title" className="font-cinzel text-3xl mb-2 text-creme">{isLogin ? "Welcome Back" : "Join Shivora"}</h2>
              <p className="text-ash text-sm font-medium">
                {isLogin ? "Access your wishlist and order history." : "Create an account to unlock exclusive benefits."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
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
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
                  <input
                    type="password"
                    id="auth-password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-ash/5 border border-ash/10 py-3 pl-12 pr-4 text-sm text-creme placeholder:text-ash/50 outline-none focus:border-creme/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold cursor-pointer hover:bg-primary hover:text-creme transition-all duration-300 flex justify-center items-center gap-2 group"
              >
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ash/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                <span className="bg-obsidian px-3 text-ash">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 bg-white text-gray-800 tracking-[0.15em] uppercase text-xs font-semibold cursor-pointer hover:bg-gray-50 transition-all duration-300 flex justify-center items-center gap-3 border border-gray-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-ash text-xs tracking-wider cursor-pointer border-b border-transparent hover:border-ash hover:text-creme transition-all duration-200 pb-1"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useState } from "react";

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-obsidian border border-ash/10 z-[160] p-8 md:p-12 shadow-2xl rounded-sm"
          >
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 text-ash hover:text-creme transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-10">
              <h2 className="font-cinzel text-3xl mb-2 text-creme">{isLogin ? "Welcome Back" : "Join Shivora"}</h2>
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
                className="w-full py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold hover:bg-ash hover:text-creme transition-colors flex justify-center items-center gap-2 group"
              >
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-ash text-xs tracking-wider border-b border-transparent hover:border-ash transition-all pb-1"
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

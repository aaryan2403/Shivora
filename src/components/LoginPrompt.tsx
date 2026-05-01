"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, ArrowRight } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function LoginPrompt() {
  const { user, setIsAuthOpen } = useShop();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user || dismissed) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [user, dismissed]);

  // Hide if user logs in while prompt is visible
  useEffect(() => {
    if (user) setVisible(false);
  }, [user]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  const handleLogin = () => {
    setVisible(false);
    setIsAuthOpen(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-obsidian/40 backdrop-blur-sm z-[140]"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.15 }}
            className="fixed bottom-6 right-6 z-[145] w-full max-w-sm bg-obsidian border border-ash/15 shadow-2xl rounded-sm overflow-hidden"
          >
            {/* Accent line */}
            <div className="h-0.5 w-full bg-primary/60" />

            <div className="p-6 relative">
              {/* Close */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss login prompt"
                className="absolute top-4 right-4 text-ash hover:text-creme transition-colors duration-200"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/15 border border-primary/25 flex items-center justify-center rounded-sm">
                  <User size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-creme leading-tight">Welcome to Shivora</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ash mt-0.5">Sign in to continue</p>
                </div>
              </div>

              <p className="text-ash text-sm leading-relaxed mb-5 max-w-[260px]">
                Log in to save your favorites, track orders, and experience the full collection.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="flex-1 py-3 bg-creme text-obsidian tracking-[0.15em] uppercase text-[11px] font-semibold cursor-pointer hover:bg-primary transition-all duration-300 flex justify-center items-center gap-2 group"
                >
                  Log In
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-5 py-3 border border-ash/20 text-ash text-[11px] uppercase tracking-[0.15em] cursor-pointer hover:text-creme hover:border-ash/40 transition-all duration-200"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Clock } from "lucide-react";

export default function AdminForbiddenPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.replace("/");
    }
  }, [countdown, router]);

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-obsidian/60 border border-red-500/20 backdrop-blur-md p-10 rounded-sm shadow-2xl text-center"
      >
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={28} className="text-red-400" />
        </div>

        <h1 className="font-serif text-3xl mb-3">Access Restricted</h1>
        <p className="text-ash text-sm mb-8 leading-relaxed">
          Only accessible by the admin.
        </p>

        <div className="flex items-center justify-center gap-2 text-red-300 text-xs uppercase tracking-[0.2em]">
          <Clock size={14} />
          <span>Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}</span>
        </div>
      </motion.div>
    </main>
  );
}

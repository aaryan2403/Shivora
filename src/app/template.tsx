"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Home page enters from the left (sliding right) when coming back.
  // Other pages enter from the right (sliding left) when going from the main page.
  // We'll reverse the interpretation to match the user's exact words:
  // "sliding animation to the right side when going from the main page" -> Other pages start at -100% (left) and slide right to 0.
  // "when coming back it should do the transition to the left side" -> Home page starts at 100% (right) and slides left to 0.
  
  const isHome = pathname === "/";

  return (
    <motion.div
      initial={{ x: isHome ? "100%" : "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.6 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

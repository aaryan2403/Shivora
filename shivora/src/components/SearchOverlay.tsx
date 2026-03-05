"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery } = useShop();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleSearch = (term?: string) => {
    const query = term || searchQuery;
    if (query.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-[150]"
            onClick={() => setIsSearchOpen(false)}
          />
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 w-full bg-obsidian border-b border-ash/10 z-[160] p-8 md:p-12 shadow-2xl"
          >
            <div className="max-w-4xl mx-auto relative">
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute -top-6 -right-4 text-ash hover:text-creme transition-colors p-2"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4 border-b border-ash/20 pb-4">
                <Search size={24} className="text-creme" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search collections, products..."
                  className="w-full bg-transparent text-2xl md:text-4xl font-cinzel text-creme placeholder:text-ash/50 outline-none"
                />
              </div>

              <div className="mt-8">
                <p className="text-ash text-xs tracking-[0.2em] uppercase mb-4">Popular Searches</p>
                <div className="flex gap-4 flex-wrap">
                  {["Obsidian Ring", "Pearl Necklace", "Ash Earrings", "Gold"].map((term) => (
                    <button 
                      key={term}
                      onClick={() => { setSearchQuery(term); handleSearch(term); }}
                      className="text-sm text-creme/70 hover:text-creme border border-ash/10 px-4 py-2 rounded-full hover:border-creme/50 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

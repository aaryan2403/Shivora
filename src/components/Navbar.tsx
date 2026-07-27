"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, User as UserIcon, Heart, ShoppingCart, LogIn, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../context/ShopContext";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const {
    cart,
    wishlist,
    user,
    logout,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setIsAuthOpen
  } = useShop();

  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const isVisible = !isHome || hasScrolledPastHero;
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    // On home page, start hidden and show after scrolling past hero
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      // Show when scrolled 90% past hero
      const shouldShow = window.scrollY > heroHeight * 0.9;
      if (shouldShow) {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => setHasScrolledPastHero(true), 0);
      } else {
        setHasScrolledPastHero(false);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isHome]);

  // --- NAVBAR CONTROLS ---
  // Adjust the 'py-' value to make the navbar thicker or thinner (e.g., py-2, py-4, py-6)
  const NAVBAR_THICKNESS = "py-1";
  // -----------------------

  return (
    <motion.nav 
      initial={false}
      animate={{ 
        y: isVisible ? 0 : -20,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-8 w-full ${NAVBAR_THICKNESS} px-6 md:px-10 flex justify-between items-center z-[100] text-creme transition-all duration-300 bg-gradient-to-b from-primary/80 to-transparent`}
    >
      <Link href="/" className="relative w-72 h-25 ml-[-8vh]">
        <Image src="/shivlogo1.png" alt="Shivora Logo" fill className="object-contain" priority />
      </Link>
      
      <div className="hidden md:flex gap-10 text-xs tracking-[0.2em] uppercase font-bold items-center">
        {/* Collections Dropdown */}
        <div className="relative group">
          <Link href="/collections" className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300 block py-2">Collections</Link>
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="bg-obsidian/95 backdrop-blur-md border border-ash/10 shadow-xl rounded-sm py-2 min-w-[160px]">
              <Link href="/collections?category=Necklaces" className="block px-5 py-2.5 text-[11px] tracking-[0.15em] text-ash hover:text-creme hover:bg-primary/10 transition-colors duration-200">Necklaces</Link>
              <Link href="/collections?category=Bracelets" className="block px-5 py-2.5 text-[11px] tracking-[0.15em] text-ash hover:text-creme hover:bg-primary/10 transition-colors duration-200">Bracelets</Link>
              <Link href="/collections?category=Rings" className="block px-5 py-2.5 text-[11px] tracking-[0.15em] text-ash hover:text-creme hover:bg-primary/10 transition-colors duration-200">Rings</Link>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 ml-4 border-l border-creme/20 pl-10">
          <button type="button" onClick={() => setIsSearchOpen(true)} aria-label="Open search" className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300">
            <Search size={14} />
          </button>
          
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(prev => !prev)}
                aria-label={`Profile: ${user.name}`}
                className="flex items-center gap-2 cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300"
              >
                <UserIcon size={14} />
                <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-3 bg-obsidian/95 backdrop-blur-md border border-ash/10 shadow-xl rounded-sm py-2 min-w-[160px] z-[200]"
                  >
                    <div className="px-5 py-2 border-b border-ash/10 mb-1">
                      <p className="text-[10px] tracking-[0.15em] uppercase text-ash/60">Signed in as</p>
                      <p className="text-xs text-creme truncate max-w-[140px] mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-5 py-2.5 text-[11px] tracking-[0.15em] text-ash hover:text-creme hover:bg-primary/10 transition-colors duration-200"
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full text-left px-5 py-2.5 text-[11px] tracking-[0.15em] text-ash hover:text-creme hover:bg-primary/10 transition-colors duration-200 flex items-center gap-2"
                    >
                      <LogOut size={11} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button type="button" onClick={() => setIsAuthOpen(true)} aria-label="Login" className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300 flex items-center gap-2">
              <LogIn size={14} />
              <span className="hidden lg:inline">Login</span>
            </button>
          )}

          <button type="button" onClick={() => setIsWishlistOpen(true)} aria-label={`Open wishlist (${wishlist.length} items)`} className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300 flex items-center gap-2">
            <Heart size={14} className={wishlist.length > 0 ? "fill-creme text-creme" : ""} />
            <span>({wishlist.length})</span>
          </button>
          
          <button type="button" onClick={() => setIsCartOpen(true)} aria-label={`Open cart (${cart.length} items)`} className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300 flex items-center gap-2">
            <ShoppingCart size={14} className={cart.length > 0 ? "fill-creme text-creme" : ""} />
            <span>({cart.length})</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Icons */}
      <div className="md:hidden flex gap-5 text-xs items-center">
          <button type="button" onClick={() => setIsSearchOpen(true)} aria-label="Open search" className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300">
            <Search size={16} />
          </button>
          <button type="button" onClick={() => setIsWishlistOpen(true)} aria-label={`Open wishlist (${wishlist.length} items)`} className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300 flex items-center gap-1">
            <Heart size={16} className={wishlist.length > 0 ? "fill-creme text-creme" : ""} />
            <span>{wishlist.length}</span>
          </button>
          <button type="button" onClick={() => setIsCartOpen(true)} aria-label={`Open cart (${cart.length} items)`} className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300 flex items-center gap-1">
            <ShoppingCart size={16} className={cart.length > 0 ? "fill-creme text-creme" : ""} />
            <span>{cart.length}</span>
          </button>
          <button type="button" onClick={() => setIsMobileMenuOpen(prev => !prev)} aria-label="Open menu" className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity duration-300">
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
      </div>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden absolute top-full left-0 w-full bg-obsidian/97 backdrop-blur-lg border-b border-ash/10 shadow-2xl px-6 py-6 flex flex-col gap-1"
          >
            {[
              { label: "All Collections", href: "/collections" },
              { label: "Necklaces", href: "/collections?category=Necklaces" },
              { label: "Bracelets", href: "/collections?category=Bracelets" },
              { label: "Rings", href: "/collections?category=Rings" },
              { label: "Earrings", href: "/collections?category=Earrings" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-xs tracking-[0.2em] uppercase font-bold text-ash hover:text-creme border-b border-ash/10 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4">
              {user ? (
                <div className="flex flex-col gap-1">
                  <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-xs tracking-[0.2em] uppercase font-bold text-ash hover:text-creme flex items-center gap-2 transition-colors">
                    <UserIcon size={14} /> My Account
                  </Link>
                  <button type="button" onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="py-3 text-xs tracking-[0.2em] uppercase font-bold text-ash hover:text-creme flex items-center gap-2 transition-colors text-left">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }} className="py-3 text-xs tracking-[0.2em] uppercase font-bold text-ash hover:text-creme flex items-center gap-2 transition-colors">
                  <LogIn size={14} /> Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

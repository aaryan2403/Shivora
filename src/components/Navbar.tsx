"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, User as UserIcon, Heart, ShoppingCart, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useShop } from "../context/ShopContext";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { 
    cart, 
    wishlist, 
    user, 
    setIsCartOpen, 
    setIsWishlistOpen, 
    setIsSearchOpen, 
    setIsAuthOpen 
  } = useShop();

  const [isVisible, setIsVisible] = useState(!isHome);

  useEffect(() => {
    // If not home, always visible
    if (!isHome) {
      setIsVisible(true);
      return;
    }

    // On home page, start hidden and show after scrolling past hero
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      // Show when scrolled 90% past hero
      if (window.scrollY > heroHeight * 0.9) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <motion.nav 
      initial={false}
      animate={{ 
        y: isVisible ? 0 : -20,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-0 w-full p-6 md:p-10 flex justify-between items-center z-[100] text-creme ${isHome ? "bg-gradient-to-b from-obsidian/80 to-transparent" : "bg-obsidian shadow-lg"}`}
    >
      <Link href="/" className="relative w-72 h-25 ml-[-8vh]">
        <Image src="/shivlogo1.png" alt="Shivora Logo" fill className="object-contain" priority />
      </Link>
      
      <div className="hidden md:flex gap-10 text-xs tracking-[0.2em] uppercase font-light items-center">
        <Link href="/collections" className="hover:opacity-70 transition-opacity">Collections</Link>
        <Link href="/high-jewelry" className="hover:opacity-70 transition-opacity">High Jewelry</Link>
        
        <div className="flex items-center gap-6 ml-4 border-l border-creme/20 pl-10">
          <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-70 transition-opacity">
            <Search size={14} />
          </button>
          
          {user ? (
             <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
               <UserIcon size={14} />
               <span className="hidden lg:inline">{user.name}</span>
             </div>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="hover:opacity-70 transition-opacity flex items-center gap-2">
              <LogIn size={14} />
              <span className="hidden lg:inline">Login</span>
            </button>
          )}

          <button onClick={() => setIsWishlistOpen(true)} className="hover:opacity-70 transition-opacity flex items-center gap-2">
            <Heart size={14} className={wishlist.length > 0 ? "fill-creme text-creme" : ""} />
            <span>({wishlist.length})</span>
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="hover:opacity-70 transition-opacity flex items-center gap-2">
            <ShoppingCart size={14} className={cart.length > 0 ? "fill-creme text-creme" : ""} />
            <span>({cart.length})</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Icons */}
      <div className="md:hidden flex gap-6 text-xs items-center">
          <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-70 transition-opacity">
            <Search size={14} />
          </button>
          <button onClick={() => setIsWishlistOpen(true)} className="hover:opacity-70 transition-opacity flex items-center gap-1">
            <Heart size={14} className={wishlist.length > 0 ? "fill-creme text-creme" : ""} />
            <span>{wishlist.length}</span>
          </button>
          <button onClick={() => setIsCartOpen(true)} className="hover:opacity-70 transition-opacity flex items-center gap-1">
            <ShoppingCart size={14} className={cart.length > 0 ? "fill-creme text-creme" : ""} />
            <span>{cart.length}</span>
          </button>
      </div>
    </motion.nav>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useShop } from "../context/ShopContext";

export default function WishlistSidebar() {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist, addToCart, setIsCartOpen } = useShop();

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-obsidian/60 backdrop-blur-sm z-[110]"
            onClick={() => setIsWishlistOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-obsidian border-l border-ash/10 z-[120] p-8 flex flex-col text-creme shadow-2xl"
          >
            <div className="flex justify-between items-center mb-12">
              <h3 className="font-serif text-2xl tracking-widest">Wishlist</h3>
              <button onClick={() => setIsWishlistOpen(false)} className="text-ash cursor-pointer hover:text-creme transition-colors duration-200">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-8 pr-4">
              {wishlist.length === 0 ? (
                <p className="text-ash font-medium text-center mt-20">Your wishlist is currently empty.</p>
              ) : (
                wishlist.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-24 h-24 bg-ash/10 rounded-sm overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-serif text-lg mb-1">{item.name}</h4>
                      <p className="text-sm text-ash mb-3">{item.price}</p>
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => { addToCart(item); toggleWishlist(item); setIsCartOpen(true); setIsWishlistOpen(false); }} 
                          className="text-[10px] uppercase tracking-widest text-creme cursor-pointer hover:text-primary transition-colors duration-200 border-b border-ash/20 pb-1"
                        >
                          Move to Cart
                        </button>
                        <button onClick={() => toggleWishlist(item)} className="text-[10px] uppercase tracking-widest text-ash cursor-pointer hover:text-primary transition-colors duration-200">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

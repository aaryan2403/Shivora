"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "../context/ShopContext";

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, updateCartQuantity, removeFromCart } = useShop();

  const cartTotal = cart.reduce((total, item) => {
    const price = parseInt(item.price.replace('$', '').replace(',', ''));
    return total + price * item.quantity;
  }, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-obsidian/60 backdrop-blur-sm z-[110]"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-obsidian border-l border-ash/10 z-[120] p-8 flex flex-col text-creme shadow-2xl"
          >
            <div className="flex justify-between items-center mb-12">
              <h3 className="font-serif text-2xl tracking-widest">Your Cart</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-ash cursor-pointer hover:text-creme transition-colors duration-200">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-8 pr-4">
              {cart.length === 0 ? (
                <p className="text-ash font-medium text-center mt-20">Your cart is currently empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-24 h-24 bg-ash/10 rounded-sm overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-serif text-lg mb-1">{item.name}</h4>
                      <p className="text-sm text-ash mb-3">{item.price}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs tracking-widest border border-ash/10 px-3 py-1 rounded-full">
                          <button onClick={() => updateCartQuantity(item.id, -1)} className="text-ash cursor-pointer hover:text-creme w-4 h-4 flex items-center justify-center transition-colors duration-200">-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className="text-ash cursor-pointer hover:text-creme w-4 h-4 flex items-center justify-center transition-colors duration-200">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-[10px] uppercase tracking-widest text-ash cursor-pointer hover:text-primary transition-colors duration-200">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-8 border-t border-ash/10 mt-auto">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-ash uppercase tracking-widest text-xs">Total</span>
                  <span className="font-serif text-2xl">${cartTotal.toLocaleString()}</span>
                </div>
                <Link href="/checkout" className="w-full py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold cursor-pointer hover:bg-primary hover:text-creme transition-all duration-300 flex justify-center items-center">
                  Checkout Securely
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ShoppingBag, Heart, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../../context/ShopContext";
import { products } from "../../data/products";

function CollectionsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  
  const [activeFilter, setActiveFilter] = useState(initialCategory);
  const { addToCart, toggleWishlist, wishlist, setIsCartOpen } = useShop();

  useEffect(() => {
    if (searchParams.get("category")) {
      setActiveFilter(searchParams.get("category")!);
    }
  }, [searchParams]);

  // Filter products based on active filter
  // "All" shows everything
  // Otherwise, match against 'category' (e.g. Rings, Necklaces) OR 'collection' (e.g. Obsidian, Ash)
  const filteredProducts = activeFilter === "All"
    ? products
    : products.filter(p => 
        p.category === activeFilter || p.collection === activeFilter
      );

  const filters = ["All", "Rings", "Necklaces", "Earrings", "Bracelets", "Obsidian", "Ash", "Pearl"];

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      {/* Header */}
      <header className="p-6 md:p-10 border-b border-ash/10 flex items-center justify-between sticky top-0 bg-obsidian/90 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-2 text-ash hover:text-creme transition-colors text-xs uppercase tracking-[0.2em]">
          <ChevronLeft size={16} /> Back to Store
        </Link>
        <div className="relative w-24 h-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain" priority /></div>
        <div className="w-20"></div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-12">
        <div className="text-center mb-16">
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4 block">Catalogue</span>
          <h1 className="font-cinzel text-4xl md:text-5xl mb-6">The Collections</h1>
          <p className="text-ash font-medium leading-relaxed max-w-xl mx-auto">
            Explore our exclusive pieces. Each item is a perfection in every detail, crafted to transcend time.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 sticky top-24 z-40 py-4 bg-obsidian/95 backdrop-blur-sm border-y border-ash/10">
           {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] transition-all duration-300 border border-transparent rounded-sm ${
                activeFilter === filter 
                  ? "text-obsidian bg-creme border-creme" 
                  : "text-ash hover:text-creme hover:border-ash/20"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id}
                className="group flex flex-col"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-ash/10 mb-6 rounded-sm">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
                      product.collection === 'Obsidian' ? 'grayscale contrast-125' : 
                      product.collection === 'Ash' ? 'sepia-[.2] hue-rotate-180 brightness-75' : ''
                    }`}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
                    <button 
                      onClick={() => { addToCart(product); setIsCartOpen(true); }}
                      className="bg-creme text-obsidian px-8 py-3 rounded-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 hover:bg-white"
                    >
                      <ShoppingBag size={16} />
                      <span className="text-xs uppercase tracking-[0.2em] font-semibold">Add to Cart</span>
                    </button>
                    <button 
                      onClick={() => toggleWishlist(product)}
                      className="bg-obsidian/80 backdrop-blur-md text-creme px-8 py-3 rounded-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 hover:bg-obsidian"
                    >
                      <Heart size={16} className={wishlist.find(w => w.id === product.id) ? "fill-creme" : ""} />
                      <span className="text-xs uppercase tracking-[0.2em] font-semibold">
                        {wishlist.find(w => w.id === product.id) ? "Saved" : "Save"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-ash text-[10px] uppercase tracking-[0.3em] block mb-2">{product.collection} Collection</span>
                    <h3 className="font-cinzel text-xl group-hover:text-creme transition-colors">{product.name}</h3>
                  </div>
                  <span className="text-sm font-medium tracking-wider">{product.price}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
           <div className="text-center py-32">
             <p className="text-ash font-medium text-lg">No products found in this category.</p>
             <button 
               onClick={() => setActiveFilter("All")}
               className="mt-6 text-creme border-b border-creme pb-1 hover:opacity-70 transition-opacity text-xs uppercase tracking-[0.2em]"
             >
               View all products
             </button>
           </div>
        )}
      </div>
    </main>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian flex items-center justify-center text-creme">Loading...</div>}>
      <CollectionsContent />
    </Suspense>
  );
}

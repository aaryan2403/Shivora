"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShoppingBag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../../context/ShopContext";
import { useProducts } from "@/lib/useProducts";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchQuery, addToCart, toggleWishlist, wishlist, setIsCartOpen, openProduct } = useShop();

  const { products, loading } = useProducts();
  const [searchResults, setSearchResults] = useState(products);

  useEffect(() => {
    if (query) {
      const lowerQuery = query.toLowerCase();
      const results = products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.category.toLowerCase().includes(lowerQuery) || 
        p.collection?.toLowerCase().includes(lowerQuery)
      );
      setTimeout(() => setSearchResults(results), 0);
    } else {
      setTimeout(() => setSearchResults([]), 0);
    }
  }, [query, products]);

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      {/* Header */}
      <header className="py-4 px-6 md:px-10 border-b border-primary/20 flex items-center justify-between sticky top-0 bg-primary/40 backdrop-blur-md shadow-sm z-50">
        <Link href="/" className="flex items-center gap-2 text-ash cursor-pointer hover:text-creme transition-colors duration-300 text-xs uppercase tracking-[0.2em]">
          <ChevronLeft size={16} /> Back to Store
        </Link>
        <div className="relative w-24 h-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain" priority /></div>
        <div className="w-20"></div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-12">
        <div className="text-center mb-16">
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4 block">Search Results</span>
          <h1 className="font-serif text-3xl md:text-5xl mb-6">&quot;{query}&quot;</h1>
          <p className="text-ash font-medium leading-relaxed max-w-xl mx-auto">
            {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
          </p>
        </div>

        {/* Products Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16"
        >
          <AnimatePresence mode="popLayout">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-ash"
              >
                Loading...
              </motion.div>
            )}

            {searchResults.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={product.id} 
                className="group flex flex-col cursor-pointer"
              >
                <div 
                  className="relative aspect-[4/5] w-full overflow-hidden bg-ash/10 mb-6 rounded-sm shadow-md group-hover:shadow-primary/20 transition-shadow duration-500"
                  onClick={() => openProduct(product)}
                >
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
                  <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product); setIsCartOpen(true); }}
                      className="bg-creme text-obsidian px-8 py-3 rounded-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 cursor-pointer hover:bg-primary hover:text-creme hover:scale-105"
                    >
                      <ShoppingBag size={16} />
                      <span className="text-xs uppercase tracking-[0.2em] font-semibold">Add to Cart</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                      className="bg-obsidian/80 backdrop-blur-md text-creme px-8 py-3 rounded-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 cursor-pointer hover:bg-primary/80 hover:scale-105"
                    >
                      <Heart size={16} className={wishlist.find(w => w.id === product.id) ? "fill-creme" : ""} />
                      <span className="text-xs uppercase tracking-[0.2em] font-semibold">
                        {wishlist.find(w => w.id === product.id) ? "Saved" : "Wishlist"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-ash text-[10px] uppercase tracking-[0.3em] block mb-2">{product.collection} Collection</span>
                    <h3 className="font-serif text-xl group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                  </div>
                  <span className="text-sm font-medium tracking-wider">{product.price}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {!loading && searchResults.length === 0 && (
           <div className="text-center py-32">
             <p className="text-ash font-medium text-lg mb-6">No products found matching your search.</p>
             <Link 
               href="/collections"
               className="text-creme border-b border-creme pb-1 cursor-pointer hover:text-primary hover:border-primary transition-colors duration-300 text-xs uppercase tracking-[0.2em]"
             >
               View all collections
             </Link>
           </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian flex items-center justify-center text-creme">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}

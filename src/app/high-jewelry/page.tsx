"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShoppingBag, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useShop } from "../../context/ShopContext";
import { useProducts } from "@/lib/useProducts";

export default function HighJewelryPage() {
  const { addToCart, toggleWishlist, wishlist, setIsCartOpen, openProduct } = useShop();
  const { products, loading } = useProducts();
  const highJewelryProducts = products.filter(p => p.isHighJewelry);

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
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4 block">Exclusive</span>
          <h1 className="font-serif text-4xl md:text-5xl mb-6">High Jewelry</h1>
          <p className="text-ash font-medium leading-relaxed max-w-xl mx-auto">
            Rare. Exceptional. Eternal. Discover the pinnacle of Shivora&apos;s craftsmanship.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {loading && <div className="text-ash">Loading...</div>}

          {highJewelryProducts.map((product, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              key={product.id} 
              className="group flex flex-col cursor-pointer"
            >
              {/* Image Container */}
              <div 
                className="relative aspect-[3/4] w-full overflow-hidden bg-ash/10 mb-8 rounded-sm shadow-xl group-hover:shadow-primary/30 transition-shadow duration-700"
                onClick={() => openProduct(product)}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${
                    product.collection === 'Obsidian' ? 'grayscale contrast-125' : 
                    product.collection === 'Ash' ? 'sepia-[.2] hue-rotate-180 brightness-75' : ''
                  }`}
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(product); setIsCartOpen(true); }}
                    className="bg-creme text-obsidian px-10 py-4 rounded-sm flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 cursor-pointer hover:bg-primary hover:text-creme hover:scale-105"
                  >
                    <ShoppingBag size={18} />
                    <span className="text-sm uppercase tracking-[0.2em] font-semibold">Acquire</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className="bg-obsidian/80 backdrop-blur-md text-creme px-10 py-4 rounded-sm flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 cursor-pointer hover:bg-primary/80 hover:scale-105"
                  >
                    <Heart size={18} className={wishlist.find(w => w.id === product.id) ? "fill-creme" : ""} />
                    <span className="text-sm uppercase tracking-[0.2em] font-semibold">
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
        </div>

        {!loading && highJewelryProducts.length === 0 && (
           <div className="text-center py-32">
             <p className="text-ash font-medium text-lg">High Jewelry collection is currently being curated.</p>
           </div>
        )}
      </div>
    </main>
  );
}

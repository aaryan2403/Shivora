"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowDown, ChevronDown, ShoppingBag, Heart, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useShop, Product } from "../context/ShopContext";
import { products } from "../data/products";

export default function Home() {
  const introRef = useRef<HTMLDivElement>(null);
  
  const { addToCart, toggleWishlist, wishlist, setIsCartOpen } = useShop();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Track scroll progress of the intro container to trigger navbar
  const { scrollYProgress } = useScroll({
    target: introRef,
    offset: ["start start", "end start"]
  });

  // Intro Content Animations - Fade out as we scroll down
  const storeIntroOpacity = useTransform(scrollYProgress, [0.7, 0.9], [1, 0]);
  const storeIntroScale = useTransform(scrollYProgress, [0.7, 0.9], [1, 0.9]);

  const [activeFilter, setActiveFilter] = useState("All");
  
  const filteredProducts = activeFilter === "All" 
    ? products 
    : products.filter(p => p.collection === activeFilter);

  return (
    <main className="relative selection:bg-ash selection:text-creme bg-obsidian">
      {/* Announcement Bar */}
      <div className="absolute top-0 w-full bg-[#C5A880] text-creme text-[10px] tracking-[0.3em] uppercase py-2 text-center z-[60] font-semibold mix-blend-normal">
        Complimentary Global Shipping on all orders
      </div>

      {/* IMMERSIVE INTRO SECTION */}
      <motion.div 
        ref={introRef} 
        className="relative h-screen bg-[#C5A880] overflow-hidden flex flex-col items-center justify-center"
      >
          {/* 2. Store Intro */}
          <motion.div 
            style={{ opacity: storeIntroOpacity, scale: storeIntroScale }}
            className="flex flex-col items-center justify-center text-creme px-6 text-center pointer-events-none z-10"
          >
            <span className="text-[#291711] tracking-[0.4em] uppercase text-xs mb-6 font-light">The Masterpieces</span>
            <h2 className="font-cinzel text-5xl md:text-7xl lg:text-8xl mb-10">Iconic Designs</h2>
            <p className="text-creme/70 max-w-md mx-auto mb-16 text-sm md:text-base leading-relaxed font-medium">
              Discover pieces that redefine elegance and stand the test of time.
            </p>
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4 text-creme/60"
            >
              <ChevronDown size={24} className="opacity-70" />
            </motion.div>
          </motion.div>

          {/* Smooth Gradient Transition */}
          <div className="absolute bottom-0 left-0 w-full h-5 bg-gradient-to-t from-obsidian to-transparent z-20 pointer-events-none" />
      </motion.div>

      {/* CATEGORY SHOWCASE */}
      <section className="relative bg-obsidian text-creme py-24 px-6 md:px-12 lg:px-24 border-t border-ash/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-cinzel text-3xl md:text-5xl mb-4">Shop by Collection</h2>
            <p className="text-ash font-medium text-sm md:text-base max-w-xl mx-auto">
              Discover our signature lines, each crafted with distinct materials and unique philosophies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Obsidian", img: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=800&auto=format&fit=crop", style: "grayscale contrast-125" },
              { name: "Ash", img: "https://images.unsplash.com/photo-1599643477874-ce171143f0ce?q=80&w=800&auto=format&fit=crop", style: "sepia-[.2] hue-rotate-180 brightness-75" },
              { name: "Pearl", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop", style: "" }
            ].map(cat => (
              <div key={cat.name} className="group cursor-pointer relative h-[60vh] overflow-hidden bg-ash/10" onClick={() => {
                document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                setActiveFilter(cat.name);
              }}>
                <Image 
                  src={cat.img} 
                  alt={`${cat.name} Collection`} 
                  fill 
                  className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${cat.style}`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="font-cinzel text-2xl md:text-3xl mb-2 group-hover:text-ash transition-colors">{cat.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-creme/70 group-hover:text-creme transition-colors">
                    <span>Explore Collection</span>
                    <ArrowDown size={12} className="-rotate-90 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NORMAL SHOP SECTION */}
      <section id="shop" className="relative bg-obsidian text-creme min-h-screen py-24 px-6 md:px-12 lg:px-24 z-10 border-t border-ash/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="font-cinzel text-4xl md:text-5xl mb-4">The Shivora Collections</h2>
              <p className="text-ash font-medium max-w-lg leading-relaxed">
                Explore our exclusive pieces. Each item is a perfection in every detail.
              </p>
            </div>
            
            <div className="flex gap-6 text-xs uppercase tracking-[0.2em] overflow-x-auto w-full md:w-auto pb-4 md:pb-0">
              {["All", "Obsidian", "Ash", "Pearl"].map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap transition-colors duration-300 ${activeFilter === filter ? "text-creme border-b border-creme pb-1" : "text-ash hover:text-creme pb-1"}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  key={product.id} 
                  className="group cursor-pointer flex flex-col"
                  onClick={() => setSelectedProduct(product as Product)}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-ash/10 mb-6 rounded-sm">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-cover transition-transform duration-700 group-hover:scale-110 ${product.collection === 'Obsidian' ? 'grayscale contrast-125' : product.collection === 'Ash' ? 'sepia-[.2] hue-rotate-180 brightness-75' : ''}`}
                    />
                    <div className="absolute inset-0 bg-obsidian/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="bg-creme/90 text-obsidian px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <ShoppingBag size={16} />
                        <span className="text-xs uppercase tracking-[0.2em] font-semibold">View</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-ash text-[10px] uppercase tracking-[0.3em] block mb-2">{product.collection}</span>
                      <h3 className="font-cinzel text-xl">{product.name}</h3>
                    </div>
                    <span className="text-sm font-light tracking-wider">{product.price}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          <div className="mt-32 pt-16 border-t border-ash/10 grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Craftsmanship Section */}
            <div className="md:col-span-12 flex flex-col md:flex-row items-center gap-12 mb-16 pb-16">
              <div className="w-full md:w-1/2 aspect-[4/3] relative bg-ash/10">
                <Image 
                  src="https://images.unsplash.com/photo-1573408301145-b98c46544ea0?q=80&w=1200&auto=format&fit=crop" 
                  alt="Jewelry Craftsmanship" 
                  fill 
                  className="object-cover grayscale contrast-125 opacity-80"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4">Our Heritage</span>
                <h2 className="font-cinzel text-3xl md:text-5xl mb-6">Mastery in Every Detail</h2>
                <p className="text-ash text-sm leading-relaxed mb-8 max-w-md font-medium">
                  For over a century, our artisans have poured their soul into every creation. We source only the most exceptional materials, ensuring that when you acquire a piece from Shivora, you inherit a legacy of uncompromised perfection.
                </p>
                <Link href="/heritage" className="self-start text-[10px] tracking-[0.2em] uppercase border-b border-creme pb-1 hover:text-ash hover:border-ash transition-colors">
                  Discover Our Story
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-obsidian/60 backdrop-blur-lg"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-obsidian border border-ash/10 flex flex-col md:flex-row w-full max-w-5xl h-[80vh] md:h-[70vh] overflow-hidden relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 text-ash hover:text-creme transition-colors bg-obsidian/50 rounded-full p-2"
              >
                <X size={20} />
              </button>

              <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-ash/5">
                <Image 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  fill 
                  className={`object-cover ${selectedProduct.collection === 'Obsidian' ? 'grayscale contrast-125' : selectedProduct.collection === 'Ash' ? 'sepia-[.2] hue-rotate-180 brightness-75' : ''}`}
                />
              </div>

              <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-16 flex flex-col justify-center text-creme overflow-y-auto">
                <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4">{selectedProduct.collection} Collection</span>
                <h2 className="font-cinzel text-3xl md:text-5xl mb-6">{selectedProduct.name}</h2>
                <p className="text-xl font-medium mb-10">{selectedProduct.price}</p>
                
                <p className="text-ash text-sm leading-relaxed mb-12">
                  A masterpiece of our {selectedProduct.collection} collection. Crafted with exceptional attention to detail, this piece embodies the grace and elegance signature to Shivora.
                </p>

                <div className="flex flex-col gap-4 mt-auto">
                  <button 
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                    className="w-full py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold hover:bg-ash hover:text-creme transition-colors flex justify-center items-center gap-3"
                  >
                    <ShoppingBag size={16} /> Add to Cart
                  </button>
                  <button 
                    onClick={() => { toggleWishlist(selectedProduct); }}
                    className={`w-full py-4 border tracking-[0.2em] uppercase text-xs font-semibold transition-colors flex justify-center items-center gap-3 ${wishlist.find(w => w.id === selectedProduct.id) ? 'border-creme text-creme bg-white/5' : 'border-ash/30 text-ash hover:border-creme hover:text-creme'}`}
                  >
                    <Heart size={16} className={wishlist.find(w => w.id === selectedProduct.id) ? "fill-creme text-creme" : ""} /> 
                    {wishlist.find(w => w.id === selectedProduct.id) ? "Saved to Wishlist" : "Add to Wishlist"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

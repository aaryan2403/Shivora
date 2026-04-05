"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowDown, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "../context/ShopContext";
import { useProducts } from "@/lib/useProducts";

export default function Home() {
  const introRef = useRef<HTMLDivElement>(null);
  
  const { openProduct } = useShop();

  const { products, loading } = useProducts();

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
      <div className="absolute top-0 w-full bg-creme text-obsidian text-[10px] tracking-[0.3em] uppercase py-2 text-center z-[60] font-semibold mix-blend-normal">
        Complimentary Global Shipping on all orders
      </div>

      {/* IMMERSIVE INTRO SECTION */}
      <motion.div 
        ref={introRef} 
        className="relative h-screen bg-primary overflow-hidden flex flex-col items-center justify-center"
      >
          {/* 2. Store Intro */}
          <motion.div 
            style={{ opacity: storeIntroOpacity, scale: storeIntroScale }}
            className="flex flex-col items-center justify-center text-creme px-6 text-center pointer-events-none z-10"
          >
            <span className="text-creme/80 tracking-[0.4em] uppercase text-xs mb-6 font-bold">The Masterpieces</span>
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-10">Iconic Designs</h2>
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
            <h2 className="font-serif text-3xl md:text-5xl mb-4">Shop by Collection</h2>
            <p className="text-ash font-medium text-sm md:text-base max-w-xl mx-auto">
              Discover our signature lines, each crafted with distinct materials and unique philosophies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Obsidian", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop", style: "grayscale contrast-125" },
              { name: "Ash", img: "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?q=80&w=800&auto=format&fit=crop", style: "sepia-[.2] hue-rotate-180 brightness-75" },
              { name: "Pearl", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop", style: "" }
            ].map(cat => (
              <motion.div 
                whileHover={{ scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                key={cat.name} 
                className="group cursor-pointer relative h-[60vh] overflow-hidden bg-ash/10 rounded-sm" 
                onClick={() => {
                  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                  setActiveFilter(cat.name);
                }}
              >
                <Image 
                  src={cat.img} 
                  alt={`${cat.name} Collection`} 
                  fill 
                  className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${cat.style}`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="font-serif text-2xl md:text-3xl mb-2 group-hover:text-ash transition-colors">{cat.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-creme/70 group-hover:text-creme transition-colors">
                    <span>Explore Collection</span>
                    <ArrowDown size={12} className="-rotate-90 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NORMAL SHOP SECTION */}
      <section id="shop" className="relative bg-obsidian text-creme min-h-screen py-24 px-6 md:px-12 lg:px-24 z-10 border-t border-ash/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl mb-4">The Shivora Collections</h2>
              <p className="text-ash font-medium max-w-lg leading-relaxed">
                Explore our exclusive pieces. Each item is a perfection in every detail.
              </p>
            </div>
            
            <div className="flex gap-6 text-xs uppercase tracking-[0.2em] overflow-x-auto w-full md:w-auto pb-4 md:pb-0">
              {["All", "Obsidian", "Ash", "Pearl"].map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap transition-colors duration-300 cursor-pointer ${activeFilter === filter ? "text-creme border-b border-creme pb-1" : "text-ash hover:text-creme pb-1"}`}
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

              {!loading && filteredProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-ash"
                >
                  No products found.
                </motion.div>
              )}

              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  key={product.id} 
                  className="group cursor-pointer flex flex-col"
                  onClick={() => openProduct(product)}
                  whileHover={{ y: -8 }}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-ash/10 mb-6 rounded-sm shadow-lg group-hover:shadow-primary/10 transition-shadow duration-500">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-cover transition-transform duration-700 group-hover:scale-110 ${product.collection === 'Obsidian' ? 'grayscale contrast-125' : product.collection === 'Ash' ? 'sepia-[.2] hue-rotate-180 brightness-75' : ''}`}
                    />
                    <div className="absolute inset-0 bg-obsidian/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-creme/90 text-obsidian px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 hover:bg-creme hover:scale-105">
                        <ShoppingBag size={16} />
                        <span className="text-xs uppercase tracking-[0.2em] font-semibold">View</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-ash text-[10px] uppercase tracking-[0.3em] block mb-2">{product.collection}</span>
                      <h3 className="font-serif text-xl">{product.name}</h3>
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
                  src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=1200&auto=format&fit=crop" 
                  alt="Jewelry Craftsmanship" 
                  fill 
                  className="object-cover grayscale contrast-125 opacity-80"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4">Our Heritage</span>
                <h2 className="font-serif text-3xl md:text-5xl mb-6">Mastery in Every Detail</h2>
                <p className="text-ash text-sm leading-relaxed mb-8 max-w-md font-medium">
                  For over a century, our artisans have poured their soul into every creation. We source only the most exceptional materials, ensuring that when you acquire a piece from Shivora, you inherit a legacy of uncompromised perfection.
                </p>
                <Link href="/heritage" className="self-start text-[10px] tracking-[0.2em] uppercase border-b border-creme pb-1 cursor-pointer hover:text-primary hover:border-primary transition-colors duration-300">
                  Discover Our Story
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </section>

    </main>
  );
}

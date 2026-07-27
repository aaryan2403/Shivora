"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowDown, ShoppingBag, Truck, ShieldCheck, Gem, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "../context/ShopContext";
import { useProducts } from "@/lib/useProducts";
import { useHero } from "@/hooks/useHero";

export default function Home() {
  const introRef = useRef<HTMLDivElement>(null);
  
  const { openProduct } = useShop();

  const { products, loading } = useProducts();
  const { heroImageUrl, categoryImages } = useHero();

  const categoryData = [
    { name: "Necklaces", key: "necklaces" as const, defaultImg: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop", style: "grayscale contrast-125" },
    { name: "Bracelets", key: "bracelets" as const, defaultImg: "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?q=80&w=800&auto=format&fit=crop", style: "sepia-[.2] hue-rotate-180 brightness-75" },
    { name: "Earrings", key: "earrings" as const, defaultImg: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop", style: "" }
  ];

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
      {/* IMMERSIVE INTRO SECTION */}
      <motion.div 
        ref={introRef} 
        className={`relative h-screen overflow-hidden flex flex-col items-center justify-center ${!heroImageUrl ? "bg-primary" : ""}`}
      >
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
          {/* Cinematic overlay for depth & legibility across all hero images */}
          <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.35)_100%)]" />
          <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-black/25" />

          {/* 2. Store Intro */}
          <motion.div
            style={{ opacity: storeIntroOpacity, scale: storeIntroScale }}
            className="flex flex-col items-center justify-center text-white px-6 text-center pointer-events-none z-10 [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]"
          >
            <span className="text-white/85 tracking-[0.45em] uppercase text-[11px] md:text-xs mb-6 font-bold">The Masterpieces</span>
            <h2 className="font-serif text-6xl md:text-7xl lg:text-8xl mb-8 leading-[0.95]">Iconic Designs</h2>
            <div className="w-16 h-px bg-white/40 mb-8" />
            <p className="text-white/80 max-w-md mx-auto mb-14 text-sm md:text-base leading-relaxed font-medium">
              Discover pieces that redefine elegance and stand the test of time.
            </p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-3 text-white/70"
            >
              <span className="text-[9px] tracking-[0.3em] uppercase">Scroll</span>
              <ChevronDown size={22} className="opacity-70" />
            </motion.div>
          </motion.div>

          {/* Smooth Gradient Transition */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-obsidian to-transparent z-20 pointer-events-none" />
      </motion.div>

      {/* VALUE / TRUST STRIP */}
      <section className="relative bg-obsidian text-creme border-t border-ash/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-ash/10 border-x border-ash/10">
          {[
            { icon: Truck, title: "Complimentary Shipping", desc: "On every order, worldwide" },
            { icon: ShieldCheck, title: "Lifetime Warranty", desc: "Assured craftsmanship" },
            { icon: Gem, title: "Ethically Sourced", desc: "Conflict-free materials" },
            { icon: Sparkles, title: "Signature Gift Wrap", desc: "Presented to perfection" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3 px-4 py-10 md:py-12">
              <Icon size={22} className="text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-xs md:text-sm font-semibold tracking-wide">{title}</p>
                <p className="text-ash text-[11px] md:text-xs mt-1 font-medium">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY SHOWCASE */}
      <section className="relative bg-obsidian text-creme py-24 px-6 md:px-12 lg:px-24 border-t border-ash/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="eyebrow block mb-4">Curated Lines</span>
            <h2 className="font-serif text-3xl md:text-5xl mb-4">Shop by Collection</h2>
            <div className="w-14 h-px bg-ash/30 mx-auto mb-5" />
            <p className="text-ash font-medium text-sm md:text-base max-w-xl mx-auto">
              Discover our signature lines, each crafted with distinct materials and unique philosophies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categoryData.map(cat => (
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
                  src={categoryImages[cat.key] ?? cat.defaultImg}
                  alt={`${cat.name} Collection`}
                  fill
                  className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${cat.style}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-8 text-white">
                  <h3 className="font-serif text-2xl md:text-3xl mb-2 transition-colors">{cat.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/75 group-hover:text-white transition-colors">
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
              <span className="eyebrow block mb-4">The Boutique</span>
              <h2 className="font-serif text-4xl md:text-5xl mb-4">The Shivora Collections</h2>
              <p className="text-ash font-medium max-w-lg leading-relaxed">
                Explore our exclusive pieces. Each item is a perfection in every detail.
              </p>
            </div>
            
            <div className="flex gap-6 text-xs uppercase tracking-[0.2em] overflow-x-auto w-full md:w-auto pb-4 md:pb-0">
              {["All", "Necklaces", "Bracelets", "Earrings"].map((filter) => (
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
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-ash/10 mb-6 rounded-sm shadow-[0_10px_40px_-20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] transition-shadow duration-500">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-cover transition-transform duration-700 group-hover:scale-110 ${product.collection === 'Obsidian' ? 'grayscale contrast-125' : product.collection === 'Ash' ? 'sepia-[.2] hue-rotate-180 brightness-75' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                      <div className="bg-creme text-obsidian px-7 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 hover:scale-105 shadow-lg">
                        <ShoppingBag size={15} />
                        <span className="text-xs uppercase tracking-[0.2em] font-semibold">Quick View</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-ash text-[10px] uppercase tracking-[0.3em] block mb-2">{product.collection}</span>
                      <h3 className="font-serif text-xl group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                    </div>
                    <span className="text-sm font-medium tracking-wider whitespace-nowrap pt-0.5">{product.price}</span>
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
                <span className="eyebrow block mb-4">About Us</span>
                <h2 className="font-serif text-3xl md:text-5xl mb-6">Care in Every Detail</h2>
                <p className="text-ash text-sm leading-relaxed mb-8 max-w-md font-medium">
                  Shivora is a homegrown, family-run business. Every piece in our collection is thoughtfully chosen to bring elegance to your everyday look and help you celebrate life&apos;s special moments without compromising on quality or price.
                </p>
                <Link href="/about" className="btn-outline self-start">
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

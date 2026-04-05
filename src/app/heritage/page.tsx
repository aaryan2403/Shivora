"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HeritagePage() {
  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      {/* Header */}
      <header className="py-4 px-6 md:px-10 border-b border-primary/20 flex items-center justify-between sticky top-0 bg-primary/40 backdrop-blur-md shadow-sm z-50">
        <Link href="/" className="flex items-center gap-2 text-ash hover:text-creme transition-colors text-xs uppercase tracking-[0.2em]">
          <ChevronLeft size={16} /> Back to Store
        </Link>
        <div className="relative w-24 h-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain" priority /></div>
        <div className="w-20"></div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000&auto=format&fit=crop" 
          alt="Shivora Workshop" 
          fill 
          className="object-cover grayscale contrast-125 opacity-40"
        />
        <div className="relative z-10 text-center px-6">
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-6 block">Est. 1924</span>
          <h1 className="font-cinzel text-5xl md:text-7xl mb-6">Our Heritage</h1>
          <p className="text-creme/80 font-medium leading-relaxed max-w-xl mx-auto text-lg">
            A century of uncompromising artistry, merging the raw beauty of nature with human ingenuity.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-24 space-y-32">
        {/* Story Section 1 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-cinzel text-3xl mb-6">&quot;Beauty lies in the balance of elements.&quot;</h2>
            <p className="text-ash font-medium leading-relaxed mb-6">
              Founded in the heart of artisan Europe, Shivora began as a small family workshop dedicated to the art of gemstone cutting. Our founder, Elias Thorne, believed that every stone held a soul, waiting to be revealed by the hand of a master.
            </p>
            <p className="text-ash font-medium leading-relaxed">
              This philosophy of &quot;revealing the soul&quot; remains the cornerstone of our house today. We do not simply manufacture jewelry; we curate artifacts of beauty that are destined to become family heirlooms.
            </p>
          </div>
          <div className="relative aspect-[4/5] bg-ash/10">
             <Image 
              src="https://images.unsplash.com/photo-1617038224558-287233916d7e?q=80&w=800&auto=format&fit=crop" 
              alt="Vintage Sketch" 
              fill 
              className="object-cover sepia-[.3] contrast-125"
            />
          </div>
        </section>

        {/* Story Section 2 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
          <div className="order-2 md:order-1 relative aspect-[4/5] bg-ash/10">
             <Image 
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop" 
              alt="Pearl Crafting" 
              fill 
              className="object-cover grayscale contrast-125"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-cinzel text-3xl mb-6">The Philosophy</h2>
            <p className="text-ash font-medium leading-relaxed mb-6">
              Our aesthetic is defined by the contrast between the dark, enigmatic allure of Obsidian and the pure, luminous grace of Pearl. This duality represents the balance of nature—strength and softness, shadow and light.
            </p>
            <p className="text-ash font-medium leading-relaxed">
              Every piece is hand-finished by master jewelers who have dedicated their lives to the craft. We reject mass production in favor of slow, deliberate creation, ensuring perfection in every facet.
            </p>
          </div>
        </section>

        {/* Quote */}
        <section className="text-center border-y border-ash/10 py-24">
          <blockquote className="font-cinzel text-2xl md:text-4xl italic leading-relaxed mb-8">
            &quot;Jewelry is not merely an accessory. It is a silent language of elegance, a personal history worn against the skin.&quot;
          </blockquote>
          <cite className="text-ash tracking-[0.2em] uppercase text-xs not-italic">- Elias Thorne, Founder</cite>
        </section>
      </div>
    </main>
  );
}

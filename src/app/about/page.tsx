"use client";

import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-4">
        <div className="text-center mb-16">
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4 block">Welcome to our store</span>
          <h1 className="font-cinzel text-4xl md:text-5xl">About Us</h1>
        </div>

        <div className="mb-12 flex justify-center">
          <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden border border-ash/30">
            <Image
              src="/about-sahana.jpeg"
              alt="Sahana, founder of Shivora"
              fill
              sizes="(min-width: 768px) 240px, 192px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-6 text-ash font-medium leading-relaxed">
          <p>
            Hi, I&apos;m <span className="text-creme font-semibold">Sahana</span>, a mother of two and the founder of
            this small business. For as long as I can remember, I&apos;ve dreamed of owning a business that reflects my
            passion for style, creativity, and helping others feel confident.
          </p>
          <p>
            That dream became a reality when I started this imitation jewelry business from my home. What began as a
            small idea has grown into a brand built with care, dedication, and a love for beautiful, affordable
            jewelry. Every piece in our collection is thoughtfully chosen to bring elegance to your everyday look and
            help you celebrate life&apos;s special moments without compromising on quality or price.
          </p>
          <p>
            As a homegrown, family-run business, we believe in honest service, attention to detail, and treating every
            customer like family. Your support means more than just a purchase—it helps a dream continue to grow.
          </p>
          <p>
            Thank you for being a part of our journey. We look forward to helping you find jewelry you&apos;ll love to
            wear and cherish.
          </p>
        </div>
      </div>
    </main>
  );
}

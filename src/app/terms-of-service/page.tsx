"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TermsOfServicePage() {
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

      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-20">
        <div className="text-center mb-16">
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4 block">Legal</span>
          <h1 className="font-cinzel text-4xl md:text-5xl mb-6">Terms of Service</h1>
          <p className="text-ash font-medium leading-relaxed max-w-xl mx-auto text-sm">
            Last Updated: March 4, 2026
          </p>
        </div>

        <div className="space-y-12 text-ash font-medium leading-relaxed">
          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Shivora website ("Site") and purchasing our products, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Site.
            </p>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">2. Products and Availability</h2>
            <p>
              All products displayed on our Site are subject to availability. We reserve the right to limit the quantity of products we supply, supply only part of an order, or to divide up orders. We also reserve the right to alter the terms or duration of any special offers or sale promotions.
            </p>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">3. Pricing and Payment</h2>
            <p className="mb-4">
              Prices shown on the Site are in US Dollars and are exclusive of taxes. We accept major credit cards and other payment methods as indicated on the checkout page.
            </p>
            <p>
              We reserve the right to change prices at any time without notice. However, if you have already placed an order, the price charged will be the price shown at the time of your order.
            </p>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">4. Intellectual Property</h2>
            <p>
              All content on the Site, including text, graphics, logos, images, audio clips, and software, is the property of Shivora or its content suppliers and is protected by international copyright laws. The compilation of all content on this Site is the exclusive property of Shivora.
            </p>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">5. Limitation of Liability</h2>
            <p>
              Shivora shall not be liable for any direct, indirect, incidental, special, or consequential damages that result from the use of, or the inability to use, the materials on this site or the performance of the products, even if Shivora has been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">6. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      {/* Header */}
      <header className="py-4 px-6 md:px-10 border-b l-auto w-[20vw] border-primary/20 flex items-center justify-between sticky top-0 bg-primary/40 backdrop-blur-md shadow-sm z-50">
        <Link href="/" className="flex items-center gap-2 text-ash hover:text-creme transition-colors text-xs uppercase tracking-[0.2em]">
          <ChevronLeft size={16} /> Back to Store
        </Link>
        <div className="relative w-24 h-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain" priority /></div>
        <div className="w-20"></div>
      </header>

      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-20">
        <div className="text-center mb-16">
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4 block">Legal</span>
          <h1 className="font-cinzel text-4xl md:text-5xl mb-6">Privacy Policy</h1>
          <p className="text-ash font-medium leading-relaxed max-w-xl mx-auto text-sm">
            Last Updated: March 4, 2026
          </p>
        </div>

        <div className="space-y-12 text-ash font-medium leading-relaxed">
          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">1. Introduction</h2>
            <p>
              Shivora (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">2. Data We Collect</h2>
            <p className="mb-4">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-creme">
              <li><strong>Identity Data</strong> includes first name, maiden name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Financial Data</strong> includes bank account and payment card details.</li>
              <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-creme">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to process your transactions, provide customer support, personalize your shopping experience, and send you updates about new collections or exclusive events (if you have opted in). The terms &quot;we&quot;, &quot;us&quot;, and &quot;our&quot; refer to Shivora.
            </p>
            <div className="mt-4 p-6 border border-ash/10 bg-ash/5">
              <p className="text-creme mb-1">Shivora Privacy Team</p>
              <p className="mb-1">Email: privacy@shivora.com</p>
              <p>123 Obsidian Avenue, New York, NY 10012, USA</p>
            </div>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">3. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="font-cinzel text-xl text-creme mb-4">4. Contact Details</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact our data privacy manager at:
            </p>
            <div className="mt-4 p-6 border border-ash/10 bg-ash/5">
              <p className="text-creme mb-1">Shivora Privacy Team</p>
              <p className="mb-1">Email: privacy@shivora.com</p>
              <p>123 Obsidian Avenue, New York, NY 10012, USA</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

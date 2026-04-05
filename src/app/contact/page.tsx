"use client";

import { Mail, MapPin, Phone, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
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

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-20">
        <div className="text-center mb-16">
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4 block">Assistance</span>
          <h1 className="font-cinzel text-4xl md:text-5xl mb-6">Contact Us</h1>
          <p className="text-ash font-medium leading-relaxed max-w-xl mx-auto">
            Our dedicated concierge team is available to assist you with any inquiries regarding our collections, bespoke services, or your order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="mt-1 shrink-0 text-creme p-3 border border-ash/10 rounded-full"><Mail size={20} /></div>
              <div>
                <h3 className="font-cinzel text-xl mb-2">Email</h3>
                <p className="text-ash text-sm mb-2">General Inquiries & Support</p>
                <a href="mailto:concierge@shivora.com" className="text-creme hover:text-ash transition-colors text-lg">concierge@shivora.com</a>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="mt-1 shrink-0 text-creme p-3 border border-ash/10 rounded-full"><Phone size={20} /></div>
              <div>
                <h3 className="font-cinzel text-xl mb-2">Phone</h3>
                <p className="text-ash text-sm mb-2">Mon-Fri, 9am - 6pm EST</p>
                <a href="tel:+18005550123" className="text-creme hover:text-ash transition-colors text-lg">+1 (800) 555-0123</a>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="mt-1 shrink-0 text-creme p-3 border border-ash/10 rounded-full"><MapPin size={20} /></div>
              <div>
                <h3 className="font-cinzel text-xl mb-2">Boutique</h3>
                <p className="text-ash text-sm leading-relaxed text-lg">
                  123 Obsidian Avenue,<br />
                  New York, NY 10012<br />
                  United States
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-6 bg-ash/5 p-8 border border-ash/5">
            <h3 className="font-cinzel text-2xl mb-6">Send a Message</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs uppercase tracking-widest text-ash">Name</label>
                <input type="text" id="name" name="name" className="w-full bg-obsidian border border-ash/20 p-3 text-creme outline-none focus:border-creme transition-colors" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs uppercase tracking-widest text-ash">Email</label>
                <input type="email" id="email" name="email" className="w-full bg-obsidian border border-ash/20 p-3 text-creme outline-none focus:border-creme transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-xs uppercase tracking-widest text-ash">Subject</label>
              <select id="subject" name="subject" className="w-full bg-obsidian border border-ash/20 p-3 text-creme outline-none focus:border-creme transition-colors">
                <option>General Inquiry</option>
                <option>Order Assistance</option>
                <option>Bespoke Request</option>
                <option>Press & Media</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-xs uppercase tracking-widest text-ash">Message</label>
              <textarea id="message" name="message" rows={5} className="w-full bg-obsidian border border-ash/20 p-3 text-creme outline-none focus:border-creme transition-colors"></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold cursor-pointer hover:bg-primary hover:text-creme transition-colors duration-300">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

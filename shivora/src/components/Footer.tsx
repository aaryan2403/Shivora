"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-obsidian text-creme border-t border-ash/10 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col">
          <div className="relative w-32 h-10 mb-6">
            <Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain" />
          </div>
          <p className="text-ash font-medium text-sm leading-relaxed max-w-xs mb-8">
            Masterpieces crafted for eternity. Merging the darkness of obsidian with the purity of pearl.
          </p>
        </div>
        
        {/* Shop Links */}
        <div className="md:col-span-2 flex flex-col gap-4 text-sm font-medium">
          <h4 className="font-cinzel text-lg mb-2">Shop</h4>
          <Link href="/collections?category=All" className="text-ash hover:text-creme transition-colors">All Jewelry</Link>
          <Link href="/collections?category=Rings" className="text-ash hover:text-creme transition-colors">Rings</Link>
          <Link href="/collections?category=Necklaces" className="text-ash hover:text-creme transition-colors">Necklaces</Link>
          <Link href="/collections?category=Earrings" className="text-ash hover:text-creme transition-colors">Earrings</Link>
        </div>

        {/* Assistance Links */}
        <div className="md:col-span-2 flex flex-col gap-4 text-sm font-medium">
          <h4 className="font-cinzel text-lg mb-2">Assistance</h4>
          <Link href="/contact" className="text-ash hover:text-creme transition-colors">Contact Us</Link>
          <Link href="/faq" className="text-ash hover:text-creme transition-colors">FAQ</Link>
          <Link href="/heritage" className="text-ash hover:text-creme transition-colors">About Us</Link>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <h4 className="font-cinzel text-lg mb-2">Newsletter</h4>
          <p className="text-ash font-medium text-sm mb-4">Subscribe to receive updates on exclusive releases.</p>
          <div className="flex border-b border-ash/20 pb-2">
            <input type="email" placeholder="Email Address" className="bg-transparent outline-none flex-1 text-sm placeholder:text-ash/50 text-creme" />
            <button className="text-[10px] uppercase tracking-[0.2em] hover:text-ash transition-colors">Subscribe</button>
          </div>
          <div className="flex gap-6 mt-6 text-ash">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-creme transition-colors">IG</a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-creme transition-colors">PT</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-creme transition-colors">X</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="md:col-span-12 mt-16 pt-8 border-t border-ash/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-ash/50 gap-4">
          <span>© {new Date().getFullYear()} Shivora. All Rights Reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-creme transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-creme transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

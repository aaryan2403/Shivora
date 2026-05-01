import Image from "next/image";
import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      <div className="max-w-4xl mx-auto px-6 mt-4 text-center">
        <div className="relative w-20 h-6 mx-auto mb-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain opacity-70" /></div>
        <h1 className="font-cinzel text-5xl md:text-6xl mb-8">Client Account</h1>
        <p className="text-ash font-medium leading-relaxed max-w-2xl mx-auto">
          This page is currently being curated. Please check back later to explore our client account.
        </p>
        
        <Link 
          href="/"
          className="mt-16 px-10 py-4 border border-ash/20 text-xs tracking-[0.2em] uppercase cursor-pointer hover:bg-primary hover:border-primary hover:text-creme transition-all duration-300 inline-block"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}

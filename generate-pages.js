const fs = require('fs');
const path = require('path');

const pages = [
  { route: 'collections', title: 'Our Collections' },
  { route: 'high-jewelry', title: 'High Jewelry' },
  { route: 'search', title: 'Search' },
  { route: 'account', title: 'Client Account' },
  { route: 'heritage', title: 'Our Heritage' },
  { route: 'contact', title: 'Contact Us' },
  { route: 'shipping-returns', title: 'Shipping & Returns' },
  { route: 'care-guide', title: 'Care Guide' },
  { route: 'faq', title: 'Frequently Asked Questions' },
  { route: 'privacy-policy', title: 'Privacy Policy' },
  { route: 'terms-of-service', title: 'Terms of Service' }
];

const basePath = path.join(process.cwd(), 'src', 'app');

pages.forEach(p => {
  const dirPath = path.join(basePath, p.route);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const compName = p.route.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Page';
  
  const content = `import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ${compName}() {
  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-creme pb-20">
      {/* Header */}
      <header className="p-6 md:p-10 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ash hover:text-creme transition-colors text-xs uppercase tracking-[0.2em]">
          <ChevronLeft size={16} /> Back to Store
        </Link>
        <div className="text-2xl tracking-widest" style={{ fontFamily: 'ITC Giovanni Std Book', fontWeight: 900 }}>Shivora</div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </header>

      <div className="max-w-4xl mx-auto px-6 mt-24 text-center">
        <span className="text-ash tracking-[0.4em] uppercase text-xs mb-8 font-light block">Shivora</span>
        <h1 className="font-cinzel text-5xl md:text-6xl mb-8">${p.title}</h1>
        <p className="text-ash font-light leading-relaxed max-w-2xl mx-auto">
          This page is currently being curated. Please check back later to explore our ${p.title.toLowerCase()}.
        </p>
        
        <Link 
          href="/"
          className="mt-16 px-10 py-4 border border-white/20 text-xs tracking-[0.2em] uppercase hover:bg-creme hover:text-obsidian transition-colors inline-block"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
`;
  
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});

console.log('Pages generated!');

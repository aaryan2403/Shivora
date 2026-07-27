"use client";

import PrivacyContent from "../../components/legal/PrivacyContent";
import { LEGAL_LAST_UPDATED } from "../../lib/legal";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-4">
        <div className="text-center mb-16">
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4 block">Legal</span>
          <h1 className="font-cinzel text-4xl md:text-5xl mb-6">Privacy Policy</h1>
          <p className="text-ash font-medium leading-relaxed max-w-xl mx-auto text-sm">
            Last Updated: {LEGAL_LAST_UPDATED}
          </p>
        </div>

        <PrivacyContent />
      </div>
    </main>
  );
}

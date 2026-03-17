"use client";

import { ChevronLeft, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How do I care for my Shivora jewelry?",
    answer: "Each Shivora piece is crafted with delicate materials like Obsidian, Ash, and Pearl. We recommend keeping your jewelry dry and avoiding contact with perfumes or lotions. Clean gently with a soft cloth and store in the provided Shivora box."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we offer complimentary global shipping on all orders. Deliveries are handled by our secure logistics partners to ensure your piece arrives safely, wherever you are."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 30 days of delivery. The item must be in its original, unworn condition with all tags and packaging intact. Please contact our concierge to initiate a return."
  },
  {
    question: "Can I customize a piece?",
    answer: "We offer bespoke services for select high-jewelry pieces. Please contact our atelier through the Contact Us page to discuss your vision with our master artisans."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is dispatched, you will receive a tracking number via email. You can also track the status of your order by logging into your Shivora account."
  },
  {
    question: "Are your materials ethically sourced?",
    answer: "Absolutely. We are committed to sustainable luxury. All our gemstones and metals are sourced from conflict-free zones and suppliers who adhere to strict ethical and environmental standards."
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
          <span className="text-ash tracking-[0.3em] uppercase text-xs mb-4 block">Assistance</span>
          <h1 className="font-cinzel text-4xl md:text-5xl mb-6">Frequently Asked Questions</h1>
          <p className="text-ash font-medium leading-relaxed max-w-xl mx-auto">
            Find answers to common inquiries about our craftsmanship, services, and policies.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-ash/10 bg-ash/5">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-ash/5 transition-colors"
              >
                <span className="font-cinzel text-lg tracking-wide">{faq.question}</span>
                {openIndex === index ? <Minus size={16} className="text-ash" /> : <Plus size={16} className="text-ash" />}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-ash font-medium leading-relaxed border-t border-ash/5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center border-t border-ash/10 pt-16">
          <p className="text-ash mb-6 font-medium">Still have questions?</p>
          <Link href="/contact" className="px-10 py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold hover:bg-ash hover:text-creme transition-colors inline-block">
            Contact Concierge
          </Link>
        </div>
      </div>
    </main>
  );
}

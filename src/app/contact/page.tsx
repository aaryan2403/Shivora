"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Check, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "", company: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      setForm({ name: "", email: "", subject: "General Inquiry", message: "", company: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-4">
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

          {status === "success" ? (
            <div className="bg-ash/5 p-8 border border-ash/5 flex flex-col items-center justify-center text-center min-h-[420px]">
              <div className="p-4 border border-primary/40 rounded-full text-primary mb-6"><Check size={28} /></div>
              <h3 className="font-cinzel text-2xl mb-3">Message Sent</h3>
              <p className="text-ash text-sm max-w-sm leading-relaxed">
                Thank you for reaching out. Our concierge team will get back to you shortly.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-8 px-8 py-3 border border-ash/20 text-xs tracking-[0.2em] uppercase cursor-pointer hover:bg-primary hover:border-primary hover:text-creme transition-all duration-300"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-ash/5 p-8 border border-ash/5">
              <h3 className="font-cinzel text-2xl mb-6">Send a Message</h3>
              {/* Honeypot field — hidden from real users, catches bots */}
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs uppercase tracking-widest text-ash">Name</label>
                  <input required type="text" id="name" name="name" value={form.name} onChange={handleChange} maxLength={120} className="w-full bg-obsidian border border-ash/20 p-3 text-creme outline-none focus:border-creme transition-colors" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs uppercase tracking-widest text-ash">Email</label>
                  <input required type="email" id="email" name="email" value={form.email} onChange={handleChange} maxLength={200} className="w-full bg-obsidian border border-ash/20 p-3 text-creme outline-none focus:border-creme transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs uppercase tracking-widest text-ash">Subject</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange} className="w-full bg-obsidian border border-ash/20 p-3 text-creme outline-none focus:border-creme transition-colors">
                  <option>General Inquiry</option>
                  <option>Order Assistance</option>
                  <option>Bespoke Request</option>
                  <option>Press & Media</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs uppercase tracking-widest text-ash">Message</label>
                <textarea required id="message" name="message" value={form.message} onChange={handleChange} rows={5} maxLength={4000} className="w-full bg-obsidian border border-ash/20 p-3 text-creme outline-none focus:border-creme transition-colors"></textarea>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold cursor-pointer hover:bg-primary hover:text-creme transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "sending" ? (<><Loader2 size={14} className="animate-spin" /> Sending…</>) : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

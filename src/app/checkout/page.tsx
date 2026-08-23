"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useShop } from "../../context/ShopContext";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zipCode: "",
});

  const { cart, user, requestAuth } = useShop();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("canceled")) {
      setCanceled(true);
    }
  }, []);

  useEffect(() => {
    if (user === null) {
      requestAuth("/checkout");
    }
  }, [user, requestAuth]);

  useEffect(() => {
    // Check if all fields have some value
    const allFieldsFilled = Object.values(formData).every(val => val.trim().length > 0);
    setIsFormValid(allFieldsFilled && termsAccepted);
  }, [formData, termsAccepted]);

const cartTotal = useMemo(() => {
  return cart.reduce((total, item) => {
    const price = Number(item.price.replace(/[$,]/g, ''));
    if (isNaN(price)) return total;
    return total + price * item.quantity;
  }, 0);
}, [cart]);

const shipping =
  cartTotal >= 75
    ? 0
    : cartTotal >= 50
    ? 7.99
    : 9.99;

const grandTotal = cartTotal + shipping;

const amountUntilFreeShipping = Math.max(0, 75 - cartTotal);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || cart.length === 0) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          customerInfo: formData,
        })
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }

      // Hand off to Stripe's hosted payment page. The cart is cleared
      // only after payment succeeds (on the success page / by the user).
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-obsidian text-creme flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-ash text-sm">
            Please sign in or create an account to continue to checkout.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      <div className="max-w-6xl mx-auto px-6 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl mb-4">Secure Checkout</h1>
            <p className="text-ash font-medium">Complete your details to finalize your order.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Contact Information */}
          <section className="bg-ash/5 p-8 border border-ash/10">
            <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
              <span className="text-xs bg-creme text-obsidian w-6 h-6 flex items-center justify-center rounded-full font-sans font-bold">1</span>
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-first-name" className="text-xs uppercase tracking-[0.2em] text-ash">First Name</label>
                <input id="checkout-first-name" required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-last-name" className="text-xs uppercase tracking-[0.2em] text-ash">Last Name</label>
                <input id="checkout-last-name" required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium" />
              </div>
<div className="flex flex-col gap-2 md:col-span-2">
  <label htmlFor="checkout-email" className="text-xs uppercase tracking-[0.2em] text-ash">Email Address</label>
  <input id="checkout-email" required type="email" name="email" value={formData.email} onChange={handleChange} className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium" />
</div>

<div className="flex flex-col gap-2 md:col-span-2">
  <label
    htmlFor="checkout-phone"
    className="text-xs uppercase tracking-[0.2em] text-ash"
  >
    Phone Number
  </label>

  <input
    id="checkout-phone"
    required
    type="tel"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    placeholder="+1 416 555 1234"
    className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium"
  />
</div>
            </div>
          </section>

          {/* Shipping Information */}
          <section className="bg-ash/5 p-8 border border-ash/10">
            <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
              <span className="text-xs bg-creme text-obsidian w-6 h-6 flex items-center justify-center rounded-full font-sans font-bold">2</span>
              Shipping Destination
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="checkout-address" className="text-xs uppercase tracking-[0.2em] text-ash">Street Address</label>
                <input id="checkout-address" required type="text" name="address" value={formData.address} onChange={handleChange} className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-city" className="text-xs uppercase tracking-[0.2em] text-ash">City</label>
                <input id="checkout-city" required type="text" name="city" value={formData.city} onChange={handleChange} className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-zip-code" className="text-xs uppercase tracking-[0.2em] text-ash">Postal / Zip Code</label>
                <input id="checkout-zip-code" required type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium" />
              </div>
            </div>
          </section>

          {/* Payment Information */}
          <section className="bg-ash/5 p-8 border border-ash/10">
            <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
              <span className="text-xs bg-creme text-obsidian w-6 h-6 flex items-center justify-center rounded-full font-sans font-bold">3</span>
              Payment
            </h2>
            <div className="flex items-start gap-3 text-sm text-ash leading-relaxed">
              <Lock size={18} className="mt-0.5 flex-shrink-0 text-creme" />
              <p>
                Payment is completed securely on Stripe&rsquo;s hosted checkout. You&rsquo;ll be
                redirected after confirming your details below. We never see or store your card
                information.
              </p>
            </div>
          </section>

          {/* Terms and Submit */}
          <section className="pt-4">
            <label htmlFor="checkout-terms" className="flex items-start gap-4 cursor-pointer mb-8 group">
              <div className="relative flex items-center justify-center mt-1">
                <input 
                  id="checkout-terms"
                  type="checkbox" 
                  name="termsAccepted"
                  className="peer sr-only"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <div className="w-5 h-5 border border-ash/50 peer-checked:bg-primary peer-checked:border-primary transition-colors duration-300 flex items-center justify-center group-hover:border-primary">
                  {termsAccepted && (
                    <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#290a00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </motion.svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-ash group-hover:text-creme transition-colors font-medium leading-relaxed">
                I have read and accept the{" "}
                <Link href="/terms-of-service" target="_blank" className="underline text-creme hover:text-primary">Terms &amp; Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy-policy" target="_blank" className="underline text-creme hover:text-primary">Privacy Policy</Link>.
                I understand that imitation jewelry is only eligible for a return or exchange if it arrives
                damaged, defective, or incorrect, and that I must report this within 48 hours of delivery.
              </span>
            </label>

            {canceled && !error && (
              <div className="mb-6 p-4 border border-yellow-500/40 bg-yellow-500/10 text-yellow-100 text-sm rounded-sm">
                Payment was canceled. Your cart is intact — you can try again whenever you&rsquo;re ready.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-200 text-sm rounded-sm">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={!isFormValid || isSubmitting || cart.length === 0}
              className="w-full py-4 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold cursor-pointer hover:bg-primary hover:text-creme transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Redirecting to secure payment..." : (
                <>
                  <Lock size={14} /> Continue to Payment &mdash; ${grandTotal.toFixed(2)}
                </>
              )}
            </button>
          </section>

        </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-10 bg-ash/5 border border-ash/10 p-8">
            <h2 className="font-serif text-2xl mb-8 border-b border-ash/10 pb-4">Order Summary</h2>
            
            <div className="flex flex-col gap-6 mb-8 max-h-[50vh] overflow-y-auto pr-2">
              {cart.length === 0 ? (
                <p className="text-ash font-medium text-sm italic">Your cart is empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-20 bg-ash/10 rounded-sm overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-base mb-1">{item.name}</h4>
                      <p className="text-xs text-ash tracking-widest uppercase mb-1">Qty: {item.quantity}</p>
                      <p className="text-sm">{item.price}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-ash/10 pt-6 space-y-4 text-sm">
              <div className="flex justify-between text-ash">
                <span>Subtotal</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-ash">
  <span>Shipping</span>
  <span>
    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
  </span>
</div>
              <div className="flex justify-between text-lg pt-4 border-t border-ash/10 font-serif">
                <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Lock } from "lucide-react";

type Product = { id: number; name: string; category: string; price: string; image: string };
type CartItem = Product & { quantity: number };

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('shivora_cart');
    if (savedCart) {
      try { const parsed = JSON.parse(savedCart); setTimeout(() => setCart(parsed), 0); } catch (e) { console.error(e); }
    }
  }, []);

  const cartTotal = cart.reduce((total, item) => {
    const price = parseInt(item.price.replace('$', '').replace(',', ''));
    return total + price * item.quantity;
  }, 0);

  useEffect(() => {
    // Check if all fields have some value
    const allFieldsFilled = Object.values(formData).every(val => val.trim().length > 0);
    setTimeout(() => setIsFormValid(allFieldsFilled && termsAccepted), 0);
  }, [formData, termsAccepted]);

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
          total: cartTotal,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-obsidian text-creme flex flex-col items-center justify-center p-6 selection:bg-ash selection:text-obsidian">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-ash/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock className="text-ash" size={32} />
          </div>
          <h1 className="font-serif text-4xl mb-4">Payment Successful</h1>
          <p className="text-ash font-medium mb-10 leading-relaxed">
            Your order has been secured. You will receive a confirmation email shortly.
          </p>
          <Link 
            href="/"
            onClick={() => localStorage.removeItem('shivora_cart')}
            className="px-10 py-4 border border-ash/20 text-xs tracking-[0.2em] uppercase cursor-pointer hover:bg-primary hover:border-primary hover:text-creme transition-all duration-300 inline-block hover:scale-105"
          >
            Return to Store
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      {/* Header */}
      <header className="py-4 px-6 md:px-10 border-b border-primary/20 flex items-center justify-between sticky top-0 bg-primary/40 backdrop-blur-md shadow-sm z-50">
        <Link href="/" className="flex items-center gap-2 text-ash cursor-pointer hover:text-creme transition-colors duration-300 text-xs uppercase tracking-[0.2em]">
          <ChevronLeft size={16} /> Back to Store
        </Link>
        <div className="relative w-24 h-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain" priority /></div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
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
              Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="checkout-card-number" className="text-xs uppercase tracking-[0.2em] text-ash">Card Number</label>
                <input id="checkout-card-number" required type="text" name="cardNumber" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={handleChange} className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium placeholder:text-ash/30" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-expiry" className="text-xs uppercase tracking-[0.2em] text-ash">Expiry Date</label>
                <input id="checkout-expiry" required type="text" name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleChange} className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium placeholder:text-ash/30" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-cvc" className="text-xs uppercase tracking-[0.2em] text-ash">CVC</label>
                <input id="checkout-cvc" required type="text" name="cvc" placeholder="123" value={formData.cvc} onChange={handleChange} className="bg-transparent border-b border-ash/20 pb-2 outline-none focus:border-primary transition-colors duration-300 font-medium placeholder:text-ash/30" />
              </div>
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
                I accept with the terms and policy and privacy regulations. I understand that all sales are final for these exclusive items.
              </span>
            </label>

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
              {isSubmitting ? "Processing..." : (
                <>
                  <Lock size={14} /> Pay ${cartTotal.toLocaleString()}
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
                <span>Insured Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="flex justify-between text-lg pt-4 border-t border-ash/10 font-serif">
                <span>Total</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

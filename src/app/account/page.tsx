"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, LogOut, Loader2, ShoppingBag } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { createClient } from "@/lib/supabase/client";

type OrderItem = {
  id: number;
  quantity: number;
  price_at_time: string;
  products: { name: string; image: string | null } | null;
};

type Order = {
  id: number;
  total_amount: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-400 border-amber-400/30",
  paid: "text-emerald-400 border-emerald-400/30",
  shipped: "text-sky-400 border-sky-400/30",
  delivered: "text-emerald-400 border-emerald-400/30",
  cancelled: "text-red-400 border-red-400/30",
};

function formatPrice(value: string) {
  const num = Number(String(value).replace(/[$,]/g, ""));
  if (Number.isNaN(num)) return value;
  return `$${num.toLocaleString()}`;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return value;
  }
}

export default function AccountPage() {
  const { user, logout, setIsAuthOpen } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    supabase
      .from("orders")
      .select("id, total_amount, status, created_at, order_items ( id, quantity, price_at_time, products ( name, image ) )")
      .eq("customer_email", user.email)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setError("We couldn't load your orders right now.");
        } else {
          setOrders((data as unknown as Order[]) ?? []);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.email]);

  // Not signed in
  if (!user) {
    return (
      <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
        <div className="max-w-4xl mx-auto px-6 mt-4 text-center">
          <div className="relative w-20 h-6 mx-auto mb-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain opacity-70" /></div>
          <h1 className="font-cinzel text-5xl md:text-6xl mb-8">Client Account</h1>
          <p className="text-ash font-medium leading-relaxed max-w-2xl mx-auto">
            Sign in to view your profile and order history.
          </p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="mt-12 px-10 py-4 bg-creme text-obsidian text-xs tracking-[0.2em] uppercase cursor-pointer hover:bg-primary hover:text-creme transition-all duration-300 inline-block"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      <div className="max-w-4xl mx-auto px-6 mt-4">
        <div className="text-center mb-12">
          <div className="relative w-20 h-6 mx-auto mb-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain opacity-70" /></div>
          <h1 className="font-cinzel text-4xl md:text-5xl">Client Account</h1>
        </div>

        {/* Profile */}
        <section className="bg-ash/5 border border-ash/10 p-8 mb-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-widest text-ash mb-2">Signed in as</p>
              <p className="font-cinzel text-2xl mb-1">{user.name}</p>
              <p className="text-ash text-sm">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 border border-ash/20 text-xs tracking-[0.2em] uppercase cursor-pointer hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 transition-all duration-300"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </section>

        {/* Orders */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Package size={18} className="text-ash" />
            <h2 className="font-cinzel text-2xl">Order History</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-ash">
              <Loader2 size={20} className="animate-spin mr-3" /> Loading your orders…
            </div>
          ) : error ? (
            <p className="text-sm text-red-400 py-10">{error}</p>
          ) : orders.length === 0 ? (
            <div className="bg-ash/5 border border-ash/10 p-12 text-center">
              <ShoppingBag size={28} className="mx-auto text-ash mb-4" />
              <p className="text-ash mb-6">You haven&apos;t placed any orders yet.</p>
              <Link
                href="/collections"
                className="px-8 py-3 border border-ash/20 text-xs tracking-[0.2em] uppercase cursor-pointer hover:bg-primary hover:border-primary hover:text-creme transition-all duration-300 inline-block"
              >
                Explore Collections
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-ash/5 border border-ash/10 p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-ash/10">
                    <div>
                      <p className="text-sm font-medium">Order #{order.id}</p>
                      <p className="text-xs text-ash mt-1">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1 border rounded-full ${STATUS_STYLES[order.status] ?? "text-ash border-ash/30"}`}>
                        {order.status}
                      </span>
                      <span className="font-cinzel text-lg">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                  <div className="pt-4 space-y-3">
                    {(order.order_items ?? []).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0 bg-obsidian border border-ash/10 overflow-hidden">
                          {item.products?.image && (
                            <Image src={item.products.image} alt={item.products?.name ?? "Product"} fill className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.products?.name ?? "Product"}</p>
                          <p className="text-xs text-ash">Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm text-ash">{formatPrice(item.price_at_time)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Clock } from "lucide-react";
import { useShop, ADMIN_EMAIL } from "@/context/ShopContext";

type OrderItem = {
  id: number;
  quantity: number;
  price_at_time: string;
  product_id: number;
  products: {
    name: string;
    image: string;
  };
};

type Order = {
  id: number;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  zip_code: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  order_items: OrderItem[];
};

function AdminAccessDenied() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.replace("/");
    }
  }, [countdown, router]);

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-obsidian/60 border border-red-500/20 backdrop-blur-md p-10 rounded-sm shadow-2xl text-center"
      >
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={28} className="text-red-400" />
        </div>
        <h1 className="font-serif text-3xl mb-3">Access Restricted</h1>
        <p className="text-ash text-sm mb-8 leading-relaxed">Only accessible by the admin.</p>
        <div className="flex items-center justify-center gap-2 text-red-300 text-xs uppercase tracking-[0.2em]">
          <Clock size={14} />
          <span>Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}</span>
        </div>
      </motion.div>
    </main>
  );
}

export default function AdminOrdersPage() {
  const { user } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  if (user?.email !== ADMIN_EMAIL) {
    return <AdminAccessDenied />;
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: Order["status"]) => {
    setUpdatingId(orderId);
    setUpdateError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-4">
        {updateError && (
          <div className="text-red-300 text-center py-4 mb-4">{updateError}</div>
        )}
        {loading ? (
          <div className="text-ash text-center py-20">Loading orders...</div>
        ) : error ? (
          <div className="text-red-300 text-center py-20">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-ash text-center py-20">No orders found.</div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order.id} className="border border-ash/20 bg-primary/10 rounded-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 pb-6 border-b border-ash/10">
                  <div>
                    <h2 className="font-serif text-2xl mb-1">Order #{order.id}</h2>
                    <p className="text-xs text-ash tracking-wider uppercase mb-4">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <div className="text-sm space-y-1">
                      <p><span className="text-ash">Customer:</span> {order.customer_name}</p>
                      <p><span className="text-ash">Email:</span> {order.customer_email}</p>
                      <p><span className="text-ash">Address:</span> {order.shipping_address}, {order.city} {order.zip_code}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-4">
                    <div className="text-2xl font-serif text-primary">
                      ${order.total_amount.toLocaleString()}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label htmlFor={`order-status-${order.id}`} className="text-xs uppercase tracking-[0.2em] text-ash">Status</label>
                      <select 
                        id={`order-status-${order.id}`}
                        name="status"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                        disabled={updatingId === order.id}
                        className={`bg-obsidian border border-ash/30 px-3 py-2 text-sm outline-none focus:border-creme transition-colors ${
                          order.status === 'delivered' ? 'text-green-400' :
                          order.status === 'cancelled' ? 'text-red-400' :
                          order.status === 'shipped' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {updatingId === order.id && <span className="text-xs text-ash">saving...</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-ash mb-4">Items Ordered</h3>
                  {order.order_items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-obsidian/40 p-4 border border-ash/5">
                      <div className="w-12 h-16 bg-ash/10 relative flex-shrink-0">
                        {item.products?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.products.image} alt={item.products.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-ash/20"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-serif text-lg">{item.products?.name || "Unknown Product"}</div>
                        <div className="text-xs text-ash">Qty: {item.quantity} &times; {item.price_at_time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

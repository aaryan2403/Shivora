"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      <header className="py-4 px-6 md:px-10 border-b border-primary/20 flex items-center justify-between sticky top-0 bg-primary/40 backdrop-blur-md shadow-sm z-50">
        <Link href="/admin" className="flex items-center gap-2 text-ash cursor-pointer hover:text-creme transition-colors duration-300 text-xs uppercase tracking-[0.2em]">
          <ChevronLeft size={16} /> Back to Admin
        </Link>
        <h1 className="font-serif text-xl tracking-widest text-primary">Orders</h1>
        <div className="w-24"></div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-12">
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
                      <label className="text-xs uppercase tracking-[0.2em] text-ash">Status</label>
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
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

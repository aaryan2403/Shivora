import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/context/ShopContext";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { cart, customerInfo, total } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.firstName) {
      return NextResponse.json({ error: "Missing customer information" }, { status: 400 });
    }

    // 1. Create the order record
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: customerInfo.email,
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
        shipping_address: customerInfo.address,
        city: customerInfo.city,
        zip_code: customerInfo.zipCode,
        total_amount: total,
        status: "pending"
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    // 2. Create the order items
    const orderItems = cart.map((item: CartItem) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Decrement stock for purchased items
    // Note: In a production app with high concurrency, you'd use a Postgres function (RPC)
    // to decrement stock atomically to prevent race conditions.
    for (const item of cart) {
      if (item.stock !== undefined && item.stock !== null) {
        const newStock = Math.max(0, item.stock - item.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.id);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to process checkout" }, { status: 500 });
  }
}

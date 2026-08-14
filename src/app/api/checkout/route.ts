import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, CURRENCY } from "@/lib/stripe";
import type { CartItem } from "@/context/ShopContext";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  try {
    const body = await request.json();
    const { cart, customerInfo } = body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (
  !customerInfo ||
  !customerInfo.email ||
  !customerInfo.firstName ||
  !customerInfo.phone
) {
  return NextResponse.json(
    { error: "Missing customer information" },
    { status: 400 }
  );
}
    const parsePrice = (value: unknown): number => typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.]/g, ""))
      : NaN;

    // Prices are re-read from the database — never trust client-supplied prices.
    const productIds = cart.map((item: CartItem) => item.id).filter((id): id is number => typeof id === "number");
    const { data: dbProducts, error: productsError } = await supabase
      .from("products").select("id, name, image, price, stock").in("id", productIds);
    if (productsError) throw productsError;
const productById = new Map<
  number,
  { name: string; image: string; price: string; stock: number | null }
>(
  (dbProducts ?? []).map((p) => [
    p.id as number,
    {
      name: p.name as string,
      image: p.image as string,
      price: p.price as string,
      stock: p.stock as number | null,
    }
  ])
);

    let computedTotal = 0;
    const validatedItems: { productId: number; quantity: number; price: string }[] = [];
    const lineItems: Array<{
      quantity: number;
      price_data: {
        currency: string;
        unit_amount: number;
        product_data: { name: string; images?: string[] };
      };
    }> = [];

   for (const item of cart as CartItem[]) {
  const product = typeof item.id === "number" ? productById.get(item.id) : undefined;

  if (typeof item.id !== "number" || !product) {
    return NextResponse.json(
      { error: `Invalid product in cart: ${String(item.id)}` },
      { status: 400 }
    );
  }

  const quantity = Number(item.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { error: `Invalid quantity for product ${item.id}` },
      { status: 400 }
    );
  }

  if (product.stock !== null && quantity > product.stock) {
    return NextResponse.json(
      {
        error: `Only ${product.stock} of ${product.name} ${
          product.stock === 1 ? "is" : "are"
        } available.`,
      },
      { status: 400 }
    );
  }

  const unitPrice = parsePrice(product.price);

  if (!Number.isFinite(unitPrice)) {
    return NextResponse.json(
      { error: `Unpriced product ${item.id}` },
      { status: 400 }
    );
  }

  computedTotal += unitPrice * quantity;

  validatedItems.push({
    productId: item.id,
    quantity,
    price: product.price,
  });

  const isHttpImage = typeof product.image === "string" && /^https?:\/\//.test(product.image);
      lineItems.push({
        quantity,
        price_data: {
          currency: CURRENCY,
          unit_amount: Math.round(unitPrice * 100), // Stripe expects the smallest currency unit (cents).
          product_data: {
            name: product.name,
            ...(isHttpImage ? { images: [product.image] } : {}),
          },
        },
      });
    }
const shippingAmount =
  computedTotal >= 75
    ? 0
    : computedTotal >= 50
    ? 7.99
    : 9.99;

const finalTotal = computedTotal + shippingAmount;

if (shippingAmount > 0) {
  lineItems.push({
    quantity: 1,
    price_data: {
      currency: CURRENCY,
      unit_amount: Math.round(shippingAmount * 100),
      product_data: {
        name: "Shipping",
      },
    },
  });
}
    // 1) Create the order up front in an "unpaid" state so we have an id to
    //    attach to the Stripe session. The webhook flips it to paid.
    const { data: orderId, error: rpcError } = await supabase.rpc("create_order", {
      p_customer_email: customerInfo.email,
      p_customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
      p_customer_phone: customerInfo.phone,
      p_shipping_address: customerInfo.address,
      p_city: customerInfo.city,
      p_zip_code: customerInfo.zipCode,
      p_total_amount: `$${finalTotal.toFixed(2)}`,
      p_items: validatedItems.map((item) => ({ product_id: item.productId, quantity: item.quantity, price_at_time: item.price })),
    });
    if (rpcError) throw rpcError;

    // 2) Create the Stripe Checkout Session.
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

    const session = await getStripe().checkout.sessions.create({
  mode: "payment",

  invoice_creation: {
    enabled: true,
  },

  line_items: lineItems,
  customer_email: customerInfo.email,
  client_reference_id: String(orderId),
  metadata: { order_id: String(orderId) },
  success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/checkout?canceled=1`,
});

    return NextResponse.json({ success: true, orderId, url: session.url });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process checkout" }, { status: 500 });
  }
}

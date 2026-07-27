import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe needs the raw, unparsed body to verify the signature.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id ?? session.client_reference_id;
        if (orderId && session.payment_status === "paid") {
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "processing",
              stripe_session_id: session.id,
              stripe_payment_intent:
                typeof session.payment_intent === "string" ? session.payment_intent : null,
            })
            .eq("id", Number(orderId));
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id ?? session.client_reference_id;
        if (orderId) {
          await supabase
            .from("orders")
            .update({ payment_status: "expired", status: "cancelled" })
            .eq("id", Number(orderId))
            .eq("payment_status", "unpaid"); // don't clobber an already-paid order
        }
        break;
      }
      default:
        // Other events are acknowledged but ignored.
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

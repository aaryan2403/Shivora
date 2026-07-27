import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import ClearCartOnSuccess from "./ClearCartOnSuccess";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ session_id?: string }>;

async function resolveOrder(sessionId: string | undefined) {
  if (!sessionId) return { paid: false, orderId: null as string | null };
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.order_id ?? session.client_reference_id ?? null;
    const paid = session.payment_status === "paid";

    // Fallback reconciliation: if the webhook hasn't landed yet, mark it here.
    if (paid && orderId) {
      try {
        const supabase = createAdminClient();
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "processing",
            stripe_session_id: session.id,
            stripe_payment_intent:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
          })
          .eq("id", Number(orderId))
          .eq("payment_status", "unpaid");
      } catch {
        // Non-fatal — the webhook is the source of truth.
      }
    }
    return { paid, orderId };
  } catch {
    return { paid: false, orderId: null };
  }
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { session_id } = await searchParams;
  const { paid, orderId } = await resolveOrder(session_id);

  return (
    <main className="min-h-screen bg-obsidian text-creme flex flex-col items-center justify-center p-6 selection:bg-ash selection:text-obsidian">
      <ClearCartOnSuccess paid={paid} />
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-ash/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-creme">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-serif text-4xl mb-4">
          {paid ? "Payment Successful" : "Thank You"}
        </h1>
        <p className="text-ash font-medium mb-4 leading-relaxed">
          {paid
            ? "Your order has been confirmed. You will receive a confirmation email shortly."
            : "We've received your order. If your payment is still processing, your confirmation will follow shortly."}
        </p>
        {orderId && (
          <p className="text-xs uppercase tracking-[0.25em] text-ash mb-10">
            Order Reference&nbsp;#{orderId}
          </p>
        )}
        <Link
          href="/"
          className="px-10 py-4 border border-ash/20 text-xs tracking-[0.2em] uppercase cursor-pointer hover:bg-primary hover:border-primary hover:text-creme transition-all duration-300 inline-block hover:scale-105"
        >
          Return to Store
        </Link>
      </div>
    </main>
  );
}

import Stripe from "stripe";

let client: Stripe | null = null;

// Constructed on first use, not at module load — the build collects page data
// without runtime env vars, and a missing key must not fail the build.
export function getStripe(): Stripe {
  if (!client) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set — Stripe calls will fail.");
    }
    // No apiVersion pinned — the installed SDK uses its default account version.
    client = new Stripe(secretKey, { typescript: true });
  }
  return client;
}

// The currency all orders are charged in.
export const CURRENCY = "cad";

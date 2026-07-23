import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  // Surfaced at call time so the app still builds without the key set.
  console.warn("STRIPE_SECRET_KEY is not set — Stripe calls will fail.");
}

// No apiVersion pinned — the installed SDK uses its default account version.
export const stripe = new Stripe(secretKey ?? "", { typescript: true });

// The currency all orders are charged in.
export const CURRENCY = "cad";

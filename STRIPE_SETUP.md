# Stripe Payments — Setup Guide

Shivora uses **Stripe Hosted Checkout**. Customers pay on Stripe's secure page; card
data never touches this server. Currency is **CAD**.

## How it flows
1. Customer fills contact + shipping on `/checkout` and clicks **Continue to Payment**.
2. `/api/checkout` re-reads prices from the DB, creates a **pending / unpaid** order, then
   creates a Stripe Checkout Session and redirects the customer to Stripe.
3. Customer pays on Stripe → redirected to `/checkout/success`.
4. Stripe calls `/api/webhooks/stripe` → the order is marked **paid** and moved to
   **processing**. (The success page also reconciles as a fallback.)
5. Admin sees the payment status badge on `/admin/orders`.

---

## One-time setup

### 1. Run the database migration
Open the Supabase SQL Editor and run **`stripe-migration.sql`** (adds `payment_status`,
`stripe_session_id`, `stripe_payment_intent` to `orders`).

### 2. Fill in environment variables (`.env.local`, and your host's dashboard)
| Variable | Where to get it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → *Secret key* (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | From step 3 below (`whsec_…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** secret |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally; your real domain in production |

> `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are **server-only secrets** — never
> prefix them with `NEXT_PUBLIC_` and never commit real values.

### 3. Set up the webhook

**Local testing** (Stripe CLI):
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET`, then restart `npm run dev`.

**Production** (Stripe Dashboard → Developers → Webhooks → Add endpoint):
- URL: `https://YOUR_DOMAIN/api/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`
- Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in your host's env vars.

---

## Test it
Use Stripe's test card on the hosted page:
- Card `4242 4242 4242 4242`, any future expiry, any CVC, any postal code.
- After paying you land on `/checkout/success`; the order shows **Paid** in `/admin/orders`.
- Decline test card: `4000 0000 0000 0002`.

## Going live
1. Toggle Stripe to **Live mode**, swap in the live `sk_live_…` key.
2. Create a live-mode webhook (same events) and use its `whsec_…`.
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain.

## Notes / possible follow-ups
- Stock is decremented when the order is created (reserved at checkout start). If you'd
  rather decrement only on successful payment, move that logic into the webhook.
- Confirmation emails aren't sent yet — Stripe can email receipts, or wire an email
  provider into the webhook.

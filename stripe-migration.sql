-- ============================================================
-- SHIVORA · STRIPE PAYMENTS MIGRATION
-- Paste into the Supabase SQL Editor and run once. Idempotent.
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status        text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS stripe_session_id     text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent text;

UPDATE public.orders SET payment_status = 'unpaid' WHERE payment_status IS NULL;

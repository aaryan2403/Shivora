-- ============================================================
-- SHIVORA · MISSING DATABASE OBJECTS
-- ============================================================
-- Paste this whole file into the Supabase SQL Editor and run once.
-- Fully idempotent — safe to re-run.
--
-- Verified missing from project pnuvgnviluynlmnfuiuj on 2026-07-24:
--   • function public.is_admin()      -- every admin RLS policy depends on it
--   • function public.create_order()  -- /api/checkout calls this; without it
--                                        checkout returns 500 and no payment
--                                        can ever start
--   • table    public.messages        -- contact form target
--
-- Already present, so not repeated here: products, orders, order_items,
-- admins, site_settings, profiles, and the orders Stripe columns
-- (payment_status, stripe_session_id, stripe_payment_intent).
-- ============================================================


-- ------------------------------------------------------------
-- 1. is_admin() — run this FIRST; the policies below call it.
-- ------------------------------------------------------------
-- SECURITY DEFINER so it can read the admins table regardless of the
-- caller's own RLS, which avoids recursive policy evaluation.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  );
$$;


-- ------------------------------------------------------------
-- 2. create_order() — the one that breaks checkout.
-- ------------------------------------------------------------
-- Creates the order + its line items and decrements stock, all in one
-- transaction. SECURITY DEFINER so anonymous shoppers can check out
-- without needing direct INSERT rights on orders/order_items.
-- Returns the new order id, which /api/checkout attaches to the Stripe
-- session as metadata.order_id.
CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_email text, p_customer_name text, p_shipping_address text,
  p_city text, p_zip_code text, p_total_amount text, p_items jsonb
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_order_id integer; v_item jsonb;
BEGIN
  INSERT INTO public.orders (customer_email, customer_name, shipping_address, city, zip_code, total_amount, status)
  VALUES (p_customer_email, p_customer_name, p_shipping_address, p_city, p_zip_code, p_total_amount, 'pending')
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO public.order_items (order_id, product_id, quantity, price_at_time)
    VALUES (v_order_id, (v_item->>'product_id')::integer, (v_item->>'quantity')::integer, v_item->>'price_at_time');

    UPDATE public.products
    SET stock = GREATEST(0, stock - (v_item->>'quantity')::integer)
    WHERE id = (v_item->>'product_id')::integer AND stock IS NOT NULL;
  END LOOP;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(text, text, text, text, text, text, jsonb) TO anon, authenticated;


-- ------------------------------------------------------------
-- 3. messages — contact-form submissions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text,
  message    text NOT NULL,
  status     text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a message" ON public.messages;
DROP POLICY IF EXISTS "Admins can read messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;

CREATE POLICY "Anyone can submit a message"
  ON public.messages FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage messages"
  ON public.messages FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ------------------------------------------------------------
-- 4. Verify — all three should come back OK
-- ------------------------------------------------------------
SELECT
  to_regprocedure('public.is_admin()')                                              IS NOT NULL AS is_admin_ok,
  to_regprocedure('public.create_order(text,text,text,text,text,text,jsonb)')        IS NOT NULL AS create_order_ok,
  to_regclass('public.messages')                                                     IS NOT NULL AS messages_ok;

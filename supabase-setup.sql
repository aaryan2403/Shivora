-- ============================================================
-- SHIVORA SUPABASE SETUP SCRIPT
-- Paste this entire file into the Supabase SQL Editor and run it.
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- admins: maps Supabase Auth users to admin privileges
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- site_settings: key-value store for homepage images and future config
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   text PRIMARY KEY,
  value text
);

-- products: main product catalog
CREATE TABLE IF NOT EXISTS public.products (
  id             serial PRIMARY KEY,
  name           text NOT NULL,
  category       text NOT NULL,
  collection     text,
  price          text NOT NULL,
  image          text NOT NULL,
  images         text[],
  description    text,
  is_high_jewelry boolean DEFAULT false,
  stock          integer,
  color          text
);

-- orders: customer orders
CREATE TABLE IF NOT EXISTS public.orders (
  id               serial PRIMARY KEY,
  customer_email   text NOT NULL,
  customer_name    text NOT NULL,
  shipping_address text NOT NULL,
  city             text NOT NULL,
  zip_code         text NOT NULL,
  total_amount     text NOT NULL,
  status           text NOT NULL DEFAULT 'pending',
  created_at       timestamptz DEFAULT now()
);

-- order_items: line items per order
CREATE TABLE IF NOT EXISTS public.order_items (
  id            serial PRIMARY KEY,
  order_id      integer REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    integer REFERENCES public.products(id) ON DELETE CASCADE,
  quantity      integer NOT NULL,
  price_at_time text NOT NULL
);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public can read products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Public can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can read admin list" ON public.admins;

-- products: public read, authenticated write (app-level admin check handles the rest)
CREATE POLICY "Public can read products"
  ON public.products FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON public.products FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- site_settings: public read, authenticated write
CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- orders: public can insert (checkout), authenticated can manage
CREATE POLICY "Public can create orders"
  ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can read own orders"
  ON public.orders FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- order_items: public can insert (checkout), authenticated can manage
CREATE POLICY "Public can create order items"
  ON public.order_items FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage order items"
  ON public.order_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- admins: only authenticated users can read (app checks if current user is in the list)
CREATE POLICY "Admins can read admin list"
  ON public.admins FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- 3. STORAGE BUCKETS
-- ============================================================

-- Create the product-images bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the hero-images bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. STORAGE POLICIES
-- ============================================================

-- product-images bucket policies
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product-images" ON storage.objects;

CREATE POLICY "Public read product-images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload product-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated delete product-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');

-- hero-images bucket policies
DROP POLICY IF EXISTS "Public read hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete hero-images" ON storage.objects;

CREATE POLICY "Public read hero-images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'hero-images');

CREATE POLICY "Authenticated upload hero-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hero-images');

CREATE POLICY "Authenticated delete hero-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'hero-images');

-- ============================================================
-- 5. SECURITY HARDENING (overrides the permissive policies above)
-- Re-run this whole file to apply. This section is what actually
-- closes the holes: only admins may write catalog data or read
-- other customers' orders; customers can read only their own.
-- ============================================================

-- Helper: is the current request from an admin user?
-- SECURITY DEFINER so it can read the admins table regardless of the
-- caller's own RLS, avoiding recursive policy evaluation.
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

-- --- products: public read, ADMIN-ONLY write ---
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --- site_settings: public read, ADMIN-ONLY write ---
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --- orders: anon may create (checkout); read scoped to owner or admin ---
DROP POLICY IF EXISTS "Public can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;

CREATE POLICY "Customers read their own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.is_admin() OR customer_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins manage orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING (public.is_admin());

-- --- order_items: read scoped to the parent order's owner or admin ---
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.order_items;

CREATE POLICY "Customers read their own order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.customer_email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Admins manage order items"
  ON public.order_items FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete order items"
  ON public.order_items FOR DELETE TO authenticated
  USING (public.is_admin());

-- --- messages: contact-form submissions ---
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

-- --- storage: uploads/deletes ADMIN-ONLY (public read stays) ---
DROP POLICY IF EXISTS "Authenticated upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete hero-images" ON storage.objects;

CREATE POLICY "Admins upload product-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins delete product-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins upload hero-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hero-images' AND public.is_admin());

CREATE POLICY "Admins delete hero-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'hero-images' AND public.is_admin());

-- Checkout writes are limited to this RPC, which computes no trust boundary
-- itself: the server API passes database-derived prices and validated items.
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;

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

-- Storage updates are required for upsert uploads and remain admin-only.
DROP POLICY IF EXISTS "Admins update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update hero-images" ON storage.objects;
CREATE POLICY "Admins update product-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admins update hero-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'hero-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'hero-images' AND public.is_admin());

-- ============================================================
-- 6. STRIPE PAYMENTS
-- Adds payment tracking to orders. Idempotent — safe to re-run.
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status        text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS stripe_session_id     text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent text;

-- Backfill any pre-existing rows so the admin UI renders cleanly.
UPDATE public.orders SET payment_status = 'unpaid' WHERE payment_status IS NULL;

-- ============================================================
-- 7. DONE
-- ============================================================

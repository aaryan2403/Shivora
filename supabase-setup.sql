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
-- 5. DONE
-- ============================================================

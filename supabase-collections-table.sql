-- ============================================================
-- SHIVORA · DYNAMIC COLLECTIONS TABLE
-- ============================================================
-- Paste this whole file into the Supabase SQL Editor and run once.
-- Fully idempotent — safe to re-run.
--
-- Backs the admin "Collections" manager: admins can add/remove named
-- collections (each with an image), which render as tiles in the
-- homepage "Shop by Collection" section. Replaces the old hardcoded
-- necklaces/bracelets/earrings category-image trio in site_settings —
-- that trio is left untouched for backward compatibility, it's just
-- no longer read by the app.
--
-- Requires public.is_admin() to already exist (see
-- supabase-missing-objects.sql / supabase-setup.sql).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.collections (
  id         serial PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  image_url  text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read collections" ON public.collections;
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;

CREATE POLICY "Public can read collections"
  ON public.collections FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage collections"
  ON public.collections FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Verify
SELECT to_regclass('public.collections') IS NOT NULL AS collections_ok;

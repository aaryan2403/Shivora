-- Records which version of the Terms & Conditions / Privacy Policy each
-- account has accepted. Bumping LEGAL_VERSION in src/lib/legal.ts re-prompts
-- every account exactly once.
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  version     text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own legal acceptance" ON public.legal_acceptances;
DROP POLICY IF EXISTS "Users can insert own legal acceptance" ON public.legal_acceptances;
DROP POLICY IF EXISTS "Users can update own legal acceptance" ON public.legal_acceptances;

CREATE POLICY "Users can read own legal acceptance"
  ON public.legal_acceptances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legal acceptance"
  ON public.legal_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own legal acceptance"
  ON public.legal_acceptances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

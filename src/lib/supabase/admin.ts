import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Service-role Supabase client. Bypasses RLS — server-only.
 * Used by the Stripe webhook to mark orders as paid, since the
 * webhook has no logged-in user session.
 *
 * NEVER import this into client components.
 */
export function createAdminClient() {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment " +
        "(Supabase Dashboard → Project Settings → API → service_role key)."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

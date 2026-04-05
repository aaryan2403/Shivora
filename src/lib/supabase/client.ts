import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseBrowserKey();

  return createBrowserClient(url, anonKey);
}

function getRequiredEnv(type: "URL" | "KEY", ...names: string[]) {
  for (const name of names) {
    let raw: string | undefined;

    if (name === "NEXT_PUBLIC_SUPABASE_URL") {
      raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else if (name === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
      raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } else if (name === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
      raw = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    } else if (name === "SUPABASE_PUBLISHABLE_KEY") {
      raw = process.env.SUPABASE_PUBLISHABLE_KEY;
    } else {
      raw = process.env[name];
    }

    const value = raw?.trim();
    if (value) {
      return value;
    }
  }

  const isBrowser = typeof window !== "undefined";
  const prefix = isBrowser ? "NEXT_PUBLIC_" : "";
  const platformTip = isBrowser
    ? "In Netlify/Vercel, NEXT_PUBLIC_ variables must be set BEFORE the build. Try triggering a redeploy after setting them."
    : "If running locally, make sure .env.local exists and the dev server was started AFTER the file was saved.";

  throw new Error(
    `Missing Supabase ${type} environment variable. ` +
    `Set ${prefix}SUPABASE_${type === "URL" ? "URL" : "ANON_KEY"} in your hosting dashboard ` +
    `(accepted names: ${names.join(", ")}). ${platformTip}`.trim()
  );
}

export function getSupabaseUrl() {
  return getRequiredEnv("URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
}

export function getSupabaseBrowserKey() {
  return getRequiredEnv("KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY");
}

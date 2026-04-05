function getRequiredEnv(...names: string[]) {
  for (const name of names) {
    let value: string | undefined;

    if (name === "NEXT_PUBLIC_SUPABASE_URL") {
      value = process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else if (name === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
      value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } else if (name === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
      value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    } else {
      value = process.env[name];
    }

    if (value) {
      return value;
    }
  }

  throw new Error(`Missing Supabase environment variable. Set one of: ${names.join(", ")}`);
}

export function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log("Has NEXT_PUBLIC_SUPABASE_URL?", Boolean(value), value);

  if (value) {
    return value;
  }

  throw new Error("Missing Supabase environment variable. Set one of: NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseBrowserKey() {
  return getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

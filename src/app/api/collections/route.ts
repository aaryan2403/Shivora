import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id,name,image_url,sort_order")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    // Gracefully return an empty list if the table doesn't exist yet
    // (e.g. supabase-collections-table.sql hasn't been run).
    return NextResponse.json({ collections: [] });
  }

  return NextResponse.json(
    { collections: data ?? [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}

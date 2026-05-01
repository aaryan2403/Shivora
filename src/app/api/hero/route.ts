import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("key,value");

  if (error) {
    // Gracefully return defaults if table doesn't exist
    return NextResponse.json({
      heroImageUrl: null,
      categoryImages: {
        necklaces: null,
        bracelets: null,
        earrings: null,
      },
    });
  }

  const settings = (data ?? []) as { key: string; value: string }[];

  const heroImageUrl =
    settings.find((s) => s.key === "hero_image_url")?.value ?? null;

  const categoryImages = {
    necklaces:
      settings.find((s) => s.key === "category_necklaces")?.value ?? null,
    bracelets:
      settings.find((s) => s.key === "category_bracelets")?.value ?? null,
    earrings:
      settings.find((s) => s.key === "category_earrings")?.value ?? null,
  };

  return NextResponse.json(
    { heroImageUrl, categoryImages },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

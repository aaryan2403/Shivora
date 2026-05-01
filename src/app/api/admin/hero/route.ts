import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, status: 401 as const, error: "Unauthorized" };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    return { supabase, status: 500 as const, error: adminError.message };
  }

  if (!adminRow?.user_id) {
    return { supabase, status: 403 as const, error: "Forbidden" };
  }

  return { supabase, status: 200 as const, error: null };
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck.status !== 200) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  const body = await request.json();
  const key = body.key;
  const value = body.value ?? body.imageUrl; // support both generic and legacy shape

  if (!key || typeof key !== "string" || !value || typeof value !== "string") {
    return NextResponse.json(
      { error: "Invalid key or value" },
      { status: 400 }
    );
  }

  const { error } = await adminCheck.supabase
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck.status !== 200) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") ?? "hero_image_url";

  const { error } = await adminCheck.supabase
    .from("site_settings")
    .delete()
    .eq("key", key);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

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
  const auth = await requireAdmin();
  if (auth.status !== 200) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : null;

  if (!name) {
    return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("collections")
    .insert({ name, image_url: imageUrl })
    .select("id,name,image_url,sort_order")
    .single();

  if (error) {
    const message = error.code === "23505" ? "A collection with that name already exists" : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ collection: data }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.status !== 200) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Missing collection id" }, { status: 400 });
  }

  const updateRow: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim()) updateRow.name = body.name.trim();
  if ("imageUrl" in (body ?? {})) updateRow.image_url = body.imageUrl;
  if (Number.isFinite(body?.sortOrder)) updateRow.sort_order = body.sortOrder;

  const { data, error } = await auth.supabase
    .from("collections")
    .update(updateRow)
    .eq("id", id)
    .select("id,name,image_url,sort_order")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ collection: data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.status !== 200) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { error } = await auth.supabase.from("collections").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

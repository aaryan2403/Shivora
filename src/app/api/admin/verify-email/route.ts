import { NextResponse } from "next/server";

// Admin access is established exclusively by Supabase Auth in /api/admin/login.
export async function POST() {
  return NextResponse.json({ error: "This endpoint has been retired" }, { status: 410 });
}

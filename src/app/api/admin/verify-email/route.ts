import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "shivoraadmin@gmail.com";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (email === ADMIN_EMAIL) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("shivora_admin_demo", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

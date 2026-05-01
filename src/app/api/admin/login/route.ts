import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEMO_ADMIN = {
  username: "admin",
  password: "shivora2024",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === DEMO_ADMIN.username && password === DEMO_ADMIN.password) {
      const response = NextResponse.json({ success: true });
      
      // Set a demo admin cookie that lasts 24 hours
      response.cookies.set("shivora_admin_demo", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("shivora_admin_demo");
  return response;
}

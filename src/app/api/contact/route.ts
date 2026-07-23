import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX = { name: 120, email: 200, subject: 120, message: 4000 };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const subject = String(body?.subject ?? "General Inquiry").trim();
    const message = String(body?.message ?? "").trim();
    // Honeypot: bots fill hidden fields. Pretend success, drop silently.
    const honeypot = String(body?.company ?? "").trim();
    if (honeypot) return NextResponse.json({ success: true });

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Please fill in your name, email, and message." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (
      name.length > MAX.name ||
      email.length > MAX.email ||
      subject.length > MAX.subject ||
      message.length > MAX.message
    ) {
      return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("messages").insert({
      name,
      email,
      subject: subject.slice(0, MAX.subject),
      message,
      status: "new",
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to send message";
    console.error("Contact error:", msg);
    return NextResponse.json({ error: "Failed to send your message. Please try again." }, { status: 500 });
  }
}

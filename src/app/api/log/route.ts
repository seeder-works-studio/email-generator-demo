import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, metadata } = body;

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: action || "unknown",
    metadata: metadata || null,
    ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}

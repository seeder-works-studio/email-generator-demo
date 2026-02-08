import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callGemini, parseVariations } from "@/lib/llm-gateway";
import { buildEmailPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    recipient_name,
    recipient_title,
    company_name,
    company_url,
    industry,
    tone,
    scraped_context,
  } = body;

  if (!recipient_name || !recipient_title) {
    return NextResponse.json(
      { error: "Recipient name and title are required" },
      { status: 400 }
    );
  }

  // Get sender name from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const senderName = profile?.display_name || user.email || "Team";

  const { systemPrompt, userPrompt } = buildEmailPrompt({
    scrapedContext: scraped_context,
    recipientName: recipient_name,
    recipientTitle: recipient_title,
    companyName: company_name,
    senderName,
    tone: tone || "Consultative",
    industry: industry || "Technology",
  });

  try {
    const llmResponse = await callGemini(userPrompt, {
      systemPrompt,
      maxTokens: 3000,
    });

    const variations = parseVariations(llmResponse);

    // Save to database
    const { data: emailRecord, error: dbError } = await supabase
      .from("generated_emails")
      .insert({
        user_id: user.id,
        recipient_name,
        recipient_title,
        company_name: company_name || "",
        company_url: company_url || "",
        industry: industry || "Technology",
        tone: tone || "Consultative",
        scraped_context: scraped_context || null,
        variations,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Failed to save email:", dbError);
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: "generation",
      metadata: {
        recipient_name,
        company_name,
        industry,
        tone,
        subjects: variations.map((v) => v.subject),
      },
    });

    return NextResponse.json({
      id: emailRecord?.id || 0,
      variations,
      scraped_context,
    });
  } catch (e) {
    console.error("Generation error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Failed to generate email variations",
      },
      { status: 500 }
    );
  }
}

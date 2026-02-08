import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeUrl } from "@/lib/scraper";
import { callGemini } from "@/lib/llm-gateway";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url, company_name } = body;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  // Scrape the website directly
  const scrapeResult = await scrapeUrl(normalizedUrl);

  // Use Gemini with Google Search grounding for deeper research
  const researchPrompt = `Research this company for a B2B cold outreach email.

Company URL: ${normalizedUrl}
${company_name ? `Company Name: ${company_name}` : ""}
${scrapeResult.raw_text ? `\nWEBSITE CONTENT:\n${scrapeResult.raw_text.slice(0, 1500)}` : ""}

Provide a research profile covering:
1. Company overview and what they do
2. Key products/services
3. Industry and target market
4. Challenges they likely face
5. Where AI/automation could help them

Format as 2-3 concise paragraphs of actionable findings.`;

  try {
    const findings = await callGemini(researchPrompt, {
      maxTokens: 1200,
      useSearch: true,
    });

    return NextResponse.json({
      company_name: scrapeResult.company_name || company_name || "Unknown",
      description: scrapeResult.description,
      services: scrapeResult.services,
      industry_signals: scrapeResult.industry_signals,
      findings,
    });
  } catch (e) {
    return NextResponse.json({
      company_name: scrapeResult.company_name || company_name || "Unknown",
      description: scrapeResult.description,
      services: scrapeResult.services,
      industry_signals: scrapeResult.industry_signals,
      findings: null,
      error: e instanceof Error ? e.message : "Research failed",
    });
  }
}

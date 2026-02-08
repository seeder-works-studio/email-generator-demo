import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchBrave, scrapeUrl } from "@/lib/scraper";
import { callLLMGateway } from "@/lib/llm-gateway";

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

  // Search Brave for company info
  const searchQuery = company_name
    ? `${company_name} site:${normalizedUrl} OR ${company_name} business products services`
    : `site:${normalizedUrl} business products services`;

  const searchResults = await searchBrave(searchQuery);

  // Also scrape the website directly
  const scrapeResult = await scrapeUrl(normalizedUrl);

  if (searchResults.length === 0 && scrapeResult.error) {
    return NextResponse.json({
      company_name: company_name || "Unknown",
      findings: "Could not research this company. Please provide details manually.",
      error: scrapeResult.error,
    });
  }

  // Combine search results with scraped data
  const searchContext = searchResults
    .slice(0, 6)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.description}\nURL: ${r.url}`)
    .join("\n\n");

  const researchPrompt = `You are an expert B2B sales researcher. Analyze this data to build a prospect profile.

Company URL: ${normalizedUrl}
${company_name ? `Company Name: ${company_name}` : ""}

WEBSITE CONTENT:
${scrapeResult.raw_text?.slice(0, 1500) || "Could not scrape website"}

SEARCH RESULTS:
${searchContext || "No search results available"}

Provide a research profile covering:
1. Company overview and what they do
2. Key products/services
3. Industry and target market
4. Challenges they likely face
5. Where AI/automation could help them

Format as 2-3 concise paragraphs of actionable findings.`;

  try {
    const findings = await callLLMGateway(researchPrompt, { maxTokens: 1200 });

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

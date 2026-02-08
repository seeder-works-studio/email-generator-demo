interface PromptContext {
  scrapedContext?: {
    company_name?: string;
    description?: string;
    services?: string;
    industry_signals?: string;
  } | null;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  senderName: string;
  tone: string;
  industry: string;
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  Consultative:
    "Advisory, insight-led, thought partner tone. Position yourself as someone sharing valuable knowledge.",
  Direct:
    "Shorter sentences, stronger CTA. Get to the point quickly with confidence.",
  Casual:
    "Conversational, lighter tone. Write like you're messaging a colleague, not a stranger.",
  Formal:
    "Professional, structured tone. Proper business language throughout.",
};

export function buildEmailPrompt(ctx: PromptContext): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneGuide =
    TONE_INSTRUCTIONS[ctx.tone] || TONE_INSTRUCTIONS["Consultative"];

  const systemPrompt = `You are an expert B2B cold email copywriter for SeederWorks, an AI solutions partner.
You write personalized cold emails that get replies by being genuinely relevant and insightful.

TONE: ${ctx.tone} — ${toneGuide}

RULES:
- Never use clickbait subject lines
- Reference specific details about the target company from the scraped context
- Be genuine and human — no corporate buzzwords
- Keep emails concise (under 150 words each)
- Always sign off with the sender name provided
- Return ONLY valid JSON — no markdown, no code fences, no explanation

OUTPUT FORMAT:
Return a JSON array with exactly 3 objects, each with "subject" and "body" keys:
[{"subject": "...", "body": "..."}, {"subject": "...", "body": "..."}, {"subject": "...", "body": "..."}]`;

  let scrapedInfo = "";
  if (ctx.scrapedContext) {
    scrapedInfo = `
SCRAPED COMPANY CONTEXT:
- Company: ${ctx.scrapedContext.company_name || ctx.companyName}
- Description: ${ctx.scrapedContext.description || "N/A"}
- Services/Offerings: ${ctx.scrapedContext.services || "N/A"}
- Industry Signals: ${ctx.scrapedContext.industry_signals || "N/A"}
`;
  }

  const userPrompt = `Generate 3 cold email variations for the following recipient:

RECIPIENT: ${ctx.recipientName}, ${ctx.recipientTitle} at ${ctx.companyName}
INDUSTRY: ${ctx.industry}
SENDER NAME: ${ctx.senderName}
${scrapedInfo}

EMAIL STRUCTURE (each variation must follow this):
1. Personal opener (1-2 sentences) — Reference something specific about THEIR company from the scraped context
2. Value bridge (2-3 sentences) — Concrete examples of how AI creates business value for their company or industry
3. Competitive context (1-2 sentences) — How competitors/industry is leveraging AI
4. SeederWorks positioning (1 sentence) — Trusted advisor, not vendor
5. Soft CTA (1 sentence) — Suggest a brief chat to share insights
6. Sign-off — Use "${ctx.senderName}"

VARIATION STRATEGY:
- Variation 1: Lead with a specific observation about their company
- Variation 2: Lead with an industry trend or competitor insight
- Variation 3: Lead with a question or provocative stat about their market

Return ONLY the JSON array with 3 variations. No other text.`;

  return { systemPrompt, userPrompt };
}

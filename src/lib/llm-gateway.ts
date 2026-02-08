import { GoogleGenAI } from "@google/genai";

interface GeminiOptions {
  model?: string;
  maxTokens?: number;
  systemPrompt?: string;
  useSearch?: boolean;
}

function getClient() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY not configured");
  }
  return new GoogleGenAI({ apiKey });
}

export async function callGemini(
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  const ai = getClient();
  const model = options.model || "gemini-3-flash-preview";

  const config: Record<string, unknown> = {
    temperature: 0.8,
    maxOutputTokens: options.maxTokens || 3000,
  };

  if (options.systemPrompt) {
    config.systemInstruction = options.systemPrompt;
  }

  if (options.useSearch) {
    config.tools = [{ googleSearch: {} }];
    config.temperature = 1.0; // recommended for grounding
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config,
  });

  return response.text || "";
}

export function parseVariations(
  content: string
): Array<{ subject: string; body: string }> {
  // Strip markdown code fences if present
  let cleaned = content;
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    cleaned = lines.filter((l) => !l.trim().startsWith("```")).join("\n");
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map((v: { subject?: string; body?: string }) => ({
        subject: v.subject || "",
        body: v.body || "",
      }));
    }
  } catch {
    // Try to find JSON array in the response
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]") + 1;
    if (start !== -1 && end > start) {
      try {
        const parsed = JSON.parse(cleaned.slice(start, end));
        if (Array.isArray(parsed)) {
          return parsed.map((v: { subject?: string; body?: string }) => ({
            subject: v.subject || "",
            body: v.body || "",
          }));
        }
      } catch {
        // Fall through
      }
    }
  }

  throw new Error("Failed to parse AI response as JSON array of variations");
}

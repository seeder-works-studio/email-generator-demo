interface ScrapeResult {
  company_name: string;
  description: string;
  services: string;
  industry_signals: string;
  raw_text: string;
  error: string | null;
}

function cleanTitleName(title: string): string {
  if (!title) return "";
  let cleaned = title.replace(
    /^(Home|Welcome|Official Site|Official Website)\s*[|:\-–—]\s*/i,
    ""
  );
  for (const delimiter of [" | ", " - ", " — ", " – ", " : "]) {
    if (cleaned.includes(delimiter)) {
      const parts = cleaned.split(delimiter).filter((p) => p.trim());
      if (parts.length > 0) {
        cleaned = parts[0];
      }
      break;
    }
  }
  return cleaned.trim();
}

function extractFromHtml(html: string) {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract meta description
  let metaDesc = "";
  const metaMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
  );
  if (metaMatch) {
    metaDesc = metaMatch[1].trim();
  }
  if (!metaDesc) {
    const ogMatch = html.match(
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
    );
    if (ogMatch) metaDesc = ogMatch[1].trim();
  }

  // Extract og:site_name
  let siteName = "";
  const siteNameMatch = html.match(
    /<meta[^>]*property=["']og:site_name["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
  );
  if (siteNameMatch) siteName = siteNameMatch[1].trim();

  // Extract headings
  const headings: string[] = [];
  const headingRegex = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi;
  let match;
  let count = 0;
  while ((match = headingRegex.exec(html)) !== null && count < 10) {
    const text = match[1].replace(/<[^>]*>/g, "").trim();
    if (text) {
      headings.push(text);
      count++;
    }
  }

  // Extract body text (strip tags)
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);

  // Derive company name
  const companyName = siteName || cleanTitleName(title) || headings[0] || "";

  return { title, metaDesc, headings, bodyText, companyName };
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    company_name: "",
    description: "",
    services: "",
    industry_signals: "",
    raw_text: "",
    error: null,
  };

  try {
    let fullUrl = url;
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = "https://" + fullUrl;
    }

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const resp = await fetch(fullUrl, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      result.error = `HTTP ${resp.status} fetching URL`;
      return result;
    }

    const html = await resp.text();
    const { metaDesc, headings, bodyText, companyName } =
      extractFromHtml(html);

    // Try /about page
    let aboutText = "";
    try {
      const aboutUrl = new URL("/about", fullUrl).href;
      const aboutController = new AbortController();
      const aboutTimeout = setTimeout(() => aboutController.abort(), 10000);
      const aboutResp = await fetch(aboutUrl, {
        headers,
        signal: aboutController.signal,
      });
      clearTimeout(aboutTimeout);
      if (aboutResp.ok) {
        const aboutHtml = await aboutResp.text();
        aboutText = aboutHtml
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<nav[\s\S]*?<\/nav>/gi, "")
          .replace(/<footer[\s\S]*?<\/footer>/gi, "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 1000);
      }
    } catch {
      // Ignore about page errors
    }

    const combinedText = `${metaDesc} ${headings.join(" ")} ${bodyText} ${aboutText}`;

    result.company_name = companyName || "Unknown";
    result.description = metaDesc || headings.slice(0, 3).join(". ");
    result.services = headings.join(", ");
    result.industry_signals = combinedText.slice(0, 500);
    result.raw_text = combinedText.slice(0, 2000);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      result.error = "Request timed out after 10 seconds";
    } else {
      result.error = `Failed to scrape URL: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return result;
}

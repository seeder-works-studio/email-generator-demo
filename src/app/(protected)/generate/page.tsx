"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDUSTRIES = [
  "Technology",
  "Recruitment / HR",
  "Real Estate",
  "E-commerce",
  "Professional Services",
  "Healthcare",
  "Finance",
  "Marketing / Agency",
  "Hospitality",
  "Other",
];

const TONES = ["Consultative", "Direct", "Casual", "Formal"];

export default function GeneratePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientTitle, setRecipientTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [customIndustry, setCustomIndustry] = useState("");
  const [tone, setTone] = useState("Consultative");
  const [scrapeResult, setScrapeResult] = useState<{
    company_name: string;
    description: string;
    services: string;
    industry_signals: string;
    error?: string | null;
  } | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleScrape = async () => {
    if (!url) return;
    setScraping(true);
    setScrapeError("");
    setScrapeResult(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (result.error) {
        setScrapeError(result.error);
      } else {
        setScrapeResult(result);
        if (result.company_name && result.company_name !== "Unknown") {
          setCompanyName(result.company_name);
        }
      }
    } catch (err) {
      setScrapeError(
        err instanceof Error ? err.message : "Failed to scrape URL"
      );
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGenerating(true);
    try {
      const data = {
        recipient_name: recipientName,
        recipient_title: recipientTitle,
        company_name: companyName,
        company_url: url,
        industry: industry === "Other" ? customIndustry : industry,
        tone,
        scraped_context: scrapeResult || null,
      };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to generate emails");
      }
      // Store result in sessionStorage for the results page
      sessionStorage.setItem(
        "emailResult",
        JSON.stringify({ result, formData: data })
      );
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate emails");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="py-8 px-8">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generate Cold Email
        </h2>
        <p className="text-gray-500 text-sm mb-7">
          Enter the target company and recipient details. We&apos;ll generate 3
          variations to choose from.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Target Company URL *
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleScrape}
                disabled={scraping || !url}
              >
                {scraping ? "Scanning..." : "Scan"}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              We&apos;ll scan their website to understand their business
            </p>

            {scrapeError && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                {scrapeError} — You can still fill in the details manually.
              </div>
            )}

            {scrapeResult && !scrapeResult.error && (
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-600 mb-1">
                  Company Detected
                </h4>
                <p className="text-sm text-gray-600">
                  <strong>{scrapeResult.company_name}</strong> —{" "}
                  {scrapeResult.description}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Recipient Name *
              </label>
              <Input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Alex Chen"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Recipient Title *
              </label>
              <Input
                type="text"
                value={recipientTitle}
                onChange={(e) => setRecipientTitle(e.target.value)}
                placeholder="Head of Growth"
                required
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Company Name
            </label>
            <Input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Auto-filled from URL scan"
            />
            <p className="text-xs text-gray-400 mt-1">
              Auto-filled from URL scan. Edit if needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Industry
              </label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {industry === "Other" && (
                <Input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="Enter your industry"
                  className="mt-2"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tone
              </label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={generating || !recipientName || !recipientTitle}
            className="w-full mt-3"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Generating 3 Variations...
              </span>
            ) : (
              "Generate 3 Variations"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

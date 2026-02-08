"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VariationCard from "@/components/variation-card";
import CopyButton from "@/components/copy-button";
import { Button } from "@/components/ui/button";

interface Variation {
  subject: string;
  body: string;
}

interface ResultData {
  id: number;
  variations: Variation[];
  scraped_context?: {
    company_name?: string;
    description?: string;
    services?: string;
  } | null;
}

interface FormData {
  recipient_name: string;
  recipient_title: string;
  company_name: string;
  company_url: string;
  industry: string;
  tone: string;
  scraped_context?: Record<string, string> | null;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("emailResult");
    if (stored) {
      const parsed = JSON.parse(stored);
      setResult(parsed.result);
      setFormData(parsed.formData);
      setVariations(parsed.result.variations);
    } else {
      router.push("/generate");
    }
  }, [router]);

  const handleSelect = async (index: number) => {
    setSelected(index);
    // Log the selection
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "select_variation",
          metadata: { email_id: result?.id, variation_index: index },
        }),
      });
    } catch {
      // Non-critical
    }
  };

  const handleRegenerate = async () => {
    if (!formData) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newResult = await res.json();
      if (res.ok) {
        setResult(newResult);
        setVariations(newResult.variations);
        setSelected(null);
        sessionStorage.setItem(
          "emailResult",
          JSON.stringify({ result: newResult, formData })
        );
      }
    } catch {
      // Keep current results
    } finally {
      setRegenerating(false);
    }
  };

  const handleSubjectChange = (index: number, value: string) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], subject: value };
    setVariations(updated);
  };

  const handleBodyChange = (index: number, value: string) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], body: value };
    setVariations(updated);
  };

  if (!result) return null;

  const selectedVariation = selected !== null ? variations[selected] : null;

  return (
    <div className="py-8 px-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Your Generated Emails
      </h2>
      <p className="text-xs text-gray-400 mb-6">
        To: {formData?.recipient_name}, {formData?.recipient_title} at{" "}
        {formData?.company_name} · Tone: {formData?.tone} · 3 variations
        generated
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {variations.map((v, i) => (
          <VariationCard
            key={i}
            index={i}
            variation={v}
            selected={selected === i}
            onSelect={handleSelect}
            onSubjectChange={(val) => handleSubjectChange(i, val)}
            onBodyChange={(val) => handleBodyChange(i, val)}
          />
        ))}
      </div>

      {selectedVariation && (
        <div className="bg-gray-50 rounded-lg p-4 flex gap-3 items-center justify-center mb-5">
          <CopyButton text={selectedVariation.subject} label="Copy Subject" />
          <CopyButton text={selectedVariation.body} label="Copy Email" />
          <CopyButton
            text={`Subject: ${selectedVariation.subject}\n\n${selectedVariation.body}`}
            label="Copy Both"
          />
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          {regenerating ? "Regenerating..." : "Regenerate All"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/generate")}>
          + New Email
        </Button>
      </div>

      {result.scraped_context && (
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowContext(!showContext)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showContext ? "\u25BE" : "\u25B8"} View scraped company context
          </button>
          {showContext && (
            <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
              <p>
                <strong>Source:</strong> {formData?.company_url}
              </p>
              <p>
                <strong>Company:</strong> {result.scraped_context.company_name}
              </p>
              <p>
                <strong>Description:</strong> {result.scraped_context.description}
              </p>
              <p>
                <strong>Services:</strong> {result.scraped_context.services}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

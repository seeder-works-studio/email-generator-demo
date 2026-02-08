"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LABELS = [
  "Option A — Company Focus",
  "Option B — Industry Trend",
  "Option C — Provocative Question",
];

interface VariationCardProps {
  index: number;
  variation: { subject: string; body: string };
  selected: boolean;
  onSelect: (index: number) => void;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}

export default function VariationCard({
  index,
  variation,
  selected,
  onSelect,
  onSubjectChange,
  onBodyChange,
}: VariationCardProps) {
  const label = LABELS[index] || `Option ${index + 1}`;

  return (
    <Card
      className={`relative transition-colors ${
        selected ? "border-blue-500 bg-blue-50/30" : "hover:border-gray-300"
      }`}
    >
      <CardContent className="p-5">
        {selected && (
          <Badge className="absolute top-3 right-3 bg-blue-600">Selected</Badge>
        )}
        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
          {label}
        </div>
        <Input
          value={variation.subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="font-semibold text-sm mb-3"
          placeholder="Subject line"
        />
        <Textarea
          value={variation.body}
          onChange={(e) => onBodyChange(e.target.value)}
          rows={10}
          className="text-sm leading-relaxed text-gray-700 resize-y"
        />
        <div className="mt-3 text-center">
          <Button
            onClick={() => onSelect(index)}
            variant={selected ? "default" : "outline"}
            className="w-full"
          >
            {selected ? "Selected" : "Select This One"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  label: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm";
}

export default function CopyButton({
  text,
  label,
  variant = "default",
  size = "default",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      variant={copied ? "outline" : variant}
      size={size}
      className={copied ? "bg-green-100 text-green-700 border-green-200" : ""}
    >
      {copied ? "Copied!" : label}
    </Button>
  );
}

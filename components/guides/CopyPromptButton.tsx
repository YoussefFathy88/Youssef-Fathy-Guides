"use client";

import { useState } from "react";

type CopyPromptButtonProps = {
  text: string;
  className?: string;
};

export function CopyPromptButton({ text, className = "" }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers that block the async clipboard API.
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition sm:text-lg ${
        copied ? "bg-brand-soft text-brand-text" : "bg-brand text-white hover:opacity-90"
      } ${className}`}
    >
      {copied ? "✓ Copied!" : "Copy prompt"}
    </button>
  );
}

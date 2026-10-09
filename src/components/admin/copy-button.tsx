"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — user can still select the text manually.
    }
  }

  return (
    <button type="button" className="btn btn-ghost btn-xs" onClick={copy}>
      {copied ? "Copied!" : label}
    </button>
  );
}

"use client";

import { useState } from "react";

export default function CopyKey({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <code className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm">
        {apiKey}
      </code>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(apiKey);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="text-sm text-emerald-400 hover:underline"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

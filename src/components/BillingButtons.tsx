"use client";

import { useState } from "react";
import { PlanId } from "@/lib/plans";

async function goTo(url: string) {
  window.location.href = url;
}

export function UpgradeButton({ plan, label }: { plan: PlanId; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !data.url) {
      setError(data.error ?? "Could not start checkout.");
      return;
    }
    goTo(data.url);
  }

  return (
    <div>
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !data.url) {
      setError(data.error ?? "Could not open billing portal.");
      return;
    }
    goTo(data.url);
  }

  return (
    <div>
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-semibold hover:border-neutral-500 disabled:opacity-60"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

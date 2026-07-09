import Link from "next/link";
import { PLANS } from "@/lib/plans";

export const metadata = { title: "Pricing — Extractly" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-center text-3xl font-bold">Simple, usage-based pricing</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-neutral-400">
        Every plan includes the full extraction API. Upgrade anytime as your usage grows.
      </p>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((id) => {
          const plan = PLANS[id];
          return (
            <div
              key={id}
              className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900 p-6"
            >
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold">{plan.priceLabel}</p>
              <p className="mt-1 text-sm text-neutral-400">
                {plan.monthlyRequestLimit.toLocaleString()} requests / month
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-neutral-300">
                <li>✓ Readability + Markdown extraction</li>
                <li>✓ REST API access</li>
                <li>✓ Usage dashboard</li>
                {id !== "FREE" && <li>✓ Priority support</li>}
              </ul>
              <Link
                href={id === "FREE" ? "/signup" : "/dashboard"}
                className="mt-8 rounded-md bg-emerald-500 py-2.5 text-center font-semibold text-neutral-950 hover:bg-emerald-400"
              >
                {id === "FREE" ? "Get started free" : "Choose plan"}
              </Link>
            </div>
          );
        })}
      </div>
      <p className="mt-10 text-center text-sm text-neutral-500">
        Need more than 50,000 requests/month? <a href="mailto:sales@extractly.dev" className="underline">Contact us</a> for a custom plan.
      </p>
    </div>
  );
}

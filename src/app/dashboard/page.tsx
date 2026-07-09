import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PLANS, PlanId, requestLimitForPlan } from "@/lib/plans";
import CopyKey from "@/components/CopyKey";
import LogoutButton from "@/components/LogoutButton";
import { UpgradeButton, ManageBillingButton } from "@/components/BillingButtons";

export const metadata = { title: "Dashboard — Extractly" };

function startOfCurrentBillingCycle(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { apiKeys: true },
  });
  if (!user) redirect("/login");

  const apiKey = user.apiKeys.find((k) => !k.revokedAt) ?? user.apiKeys[0];
  const used = apiKey
    ? await prisma.usageEvent.count({
        where: { apiKeyId: apiKey.id, createdAt: { gte: startOfCurrentBillingCycle() } },
      })
    : 0;
  const limit = requestLimitForPlan(user.plan);
  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>

      <section className="mt-10 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Your API key
        </h2>
        <div className="mt-3">
          {apiKey ? <CopyKey apiKey={apiKey.key} /> : <p>No API key found.</p>}
        </div>
        <p className="mt-3 text-sm text-neutral-400">
          Send it as <code className="text-neutral-300">Authorization: Bearer &lt;key&gt;</code>{" "}
          to <code className="text-neutral-300">POST /api/extract</code>.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Usage this month
        </h2>
        <p className="mt-3 text-lg">
          {used.toLocaleString()} / {limit.toLocaleString()} requests
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-4 text-sm text-neutral-400">
          Current plan: <span className="font-semibold text-neutral-200">{PLANS[user.plan as PlanId]?.name ?? user.plan}</span>
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">Billing</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {user.plan !== "STARTER" && <UpgradeButton plan="STARTER" label="Upgrade to Starter — $9/mo" />}
          {user.plan !== "PRO" && <UpgradeButton plan="PRO" label="Upgrade to Pro — $39/mo" />}
          {user.stripeCustomerId && <ManageBillingButton />}
        </div>
      </section>
    </div>
  );
}

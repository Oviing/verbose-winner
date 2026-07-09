export type PlanId = "FREE" | "STARTER" | "PRO";

export const PLANS: Record<
  PlanId,
  {
    name: string;
    priceLabel: string;
    monthlyRequestLimit: number;
    priceEnvVar?: "STRIPE_PRICE_STARTER" | "STRIPE_PRICE_PRO";
  }
> = {
  FREE: {
    name: "Free",
    priceLabel: "$0",
    monthlyRequestLimit: 100,
  },
  STARTER: {
    name: "Starter",
    priceLabel: "$9/mo",
    monthlyRequestLimit: 5_000,
    priceEnvVar: "STRIPE_PRICE_STARTER",
  },
  PRO: {
    name: "Pro",
    priceLabel: "$39/mo",
    monthlyRequestLimit: 50_000,
    priceEnvVar: "STRIPE_PRICE_PRO",
  },
};

export function requestLimitForPlan(plan: string): number {
  return PLANS[plan as PlanId]?.monthlyRequestLimit ?? PLANS.FREE.monthlyRequestLimit;
}

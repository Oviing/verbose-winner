import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

function planFromPriceId(priceId: string | undefined): PlanId {
  if (priceId && priceId === process.env.STRIPE_PRICE_STARTER) return "STARTER";
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return "PRO";
  return "FREE";
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: planFromPriceId(priceId),
            stripeSubscriptionId: subscription.id,
            stripeCurrentPeriodEnd: new Date(subscription.items.data[0]!.current_period_end * 1000),
          },
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer as string },
      });
      if (user) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        const priceId = subscription.items.data[0]?.price.id;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: isActive ? planFromPriceId(priceId) : "FREE",
            stripeSubscriptionId: isActive ? subscription.id : null,
            stripeCurrentPeriodEnd: subscription.items.data[0]
              ? new Date(subscription.items.data[0].current_period_end * 1000)
              : null,
          },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

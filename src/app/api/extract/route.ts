import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractFromUrl, ExtractError } from "@/lib/extract";
import { requestLimitForPlan } from "@/lib/plans";

export const runtime = "nodejs";

function startOfCurrentBillingCycle(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const key = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!key) {
    return NextResponse.json(
      { error: "Missing API key. Pass it as `Authorization: Bearer <key>`." },
      { status: 401 }
    );
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: true },
  });

  if (!apiKey || apiKey.revokedAt) {
    return NextResponse.json({ error: "Invalid or revoked API key." }, { status: 401 });
  }

  const limit = requestLimitForPlan(apiKey.user.plan);
  const used = await prisma.usageEvent.count({
    where: {
      apiKeyId: apiKey.id,
      createdAt: { gte: startOfCurrentBillingCycle() },
    },
  });

  if (used >= limit) {
    return NextResponse.json(
      {
        error: `Monthly request limit of ${limit} reached for the ${apiKey.user.plan} plan. Upgrade at /pricing.`,
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";

  if (!url) {
    return NextResponse.json({ error: "Request body must include `url`." }, { status: 400 });
  }

  try {
    const result = await extractFromUrl(url);
    await prisma.usageEvent.create({
      data: { apiKeyId: apiKey.id, url, success: true },
    });
    return NextResponse.json({
      ...result,
      usage: { used: used + 1, limit, plan: apiKey.user.plan },
    });
  } catch (err) {
    await prisma.usageEvent.create({
      data: { apiKeyId: apiKey.id, url, success: false },
    });
    if (err instanceof ExtractError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}

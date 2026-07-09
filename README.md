# Extractly

Turn any webpage into clean, LLM-ready Markdown with a single API call.
Built for AI agents, RAG pipelines, and content tools that need readable
text instead of raw HTML.

- **Landing page + pricing**: `/`, `/pricing`
- **Docs**: `/docs`
- **Auth**: email/password signup & login, session via signed HTTP-only cookie
- **API**: `POST /api/extract` — API-key authenticated, Readability + Turndown
  extraction, per-plan monthly rate limits, SSRF guards (blocks localhost /
  private IP ranges)
- **Billing**: Stripe Checkout for Starter/Pro subscriptions, Stripe Customer
  Portal for self-serve management, webhook keeps plan state in sync
- **Dashboard**: shows the user's API key, usage this billing cycle, plan,
  upgrade/manage-billing buttons

## Tech stack

Next.js (App Router) + TypeScript + Tailwind, Prisma (SQLite by default,
swap to Postgres for production), Stripe, `@mozilla/readability` + `jsdom` +
`turndown` for extraction.

## Running locally

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db
npm run dev              # http://localhost:3000
```

Copy `.env.example` to `.env` and fill in values as you go (Stripe keys are
optional until you want to test billing).

## How this makes money

This is a metered API product: users sign up for a free tier (100
requests/month), and pay $9/mo (Starter, 5,000 req/mo) or $39/mo (Pro, 50,000
req/mo) via Stripe subscriptions once they outgrow it. Plan limits live in
`src/lib/plans.ts` — change the prices/limits there before launch if you want
different numbers.

### 1. Set up Stripe (real revenue path)

1. Create a [Stripe](https://dashboard.stripe.com) account and switch on
   **Live mode** once you're ready to charge real customers (test mode first).
2. In **Product catalog**, create two recurring products/prices, e.g.:
   - "Extractly Starter" — $9.00/month
   - "Extractly Pro" — $39.00/month
3. Copy each price's ID (`price_...`) into `STRIPE_PRICE_STARTER` /
   `STRIPE_PRICE_PRO`.
4. Copy your secret key (`sk_live_...` or `sk_test_...`) into
   `STRIPE_SECRET_KEY`.
5. Add a webhook endpoint in Stripe pointing at
   `https://<your-domain>/api/stripe/webhook`, subscribed to:
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
6. Enable the **Customer Portal** in Stripe settings so the "Manage billing"
   button works (lets customers cancel/update cards themselves).

### 2. Get a production database

SQLite (the local default) does not work on most serverless hosts. Before
deploying:

1. Provision a Postgres database (e.g. [Neon](https://neon.tech),
   [Supabase](https://supabase.com), or Vercel Postgres — all have free tiers).
2. In `prisma/schema.prisma`, change the datasource provider from `sqlite` to
   `postgresql`.
3. Set `DATABASE_URL` to the Postgres connection string.
4. Run `npx prisma migrate deploy` against it once before first deploy.

### 3. Deploy

The app is a standard Next.js app — deploy to
[Vercel](https://vercel.com/new) (recommended, zero config) or any Node
host:

1. Push this repo to GitHub and import it in Vercel.
2. Add all variables from `.env.example` in Vercel's Environment Variables
   settings (production values — real Stripe keys, real `DATABASE_URL`, a
   long random `SESSION_SECRET`, and `NEXT_PUBLIC_APP_URL` set to your real
   domain).
3. Deploy. Point your Stripe webhook at the deployed URL (see step 1.5).

### 4. Get your first customers

- Submit the API to directories AI/agent developers actually browse:
  [ThereIsAnAIForThat](https://theresanaiforthat.com),
  [Product Hunt](https://www.producthunt.com), r/LocalLLaMA, r/AI_Agents,
  Hacker News "Show HN".
- List it on API marketplaces: [RapidAPI](https://rapidapi.com) — instant
  distribution to developers already paying for APIs.
- Write 2-3 short posts showing "how to feed clean web content to an LLM
  agent" using this API — SEO + demonstrates the product.
- Add usage-based upsells later (higher tiers, team seats, a
  `POST /api/extract/batch` endpoint) once you have real usage data in the
  dashboard.

## Project structure

```
src/app/                    pages + API routes (App Router)
src/app/api/extract          the paid extraction endpoint
src/app/api/stripe/          checkout, portal, webhook
src/app/api/auth/            signup, login, logout
src/lib/extract.ts           Readability + Turndown extraction, SSRF guard
src/lib/plans.ts             plan names/prices/limits — edit here to reprice
src/lib/session.ts           signed cookie session (no external auth service)
src/lib/stripe.ts            Stripe client
prisma/schema.prisma         User / ApiKey / UsageEvent models
```

## Notes on the current implementation

- Rate limiting counts `UsageEvent` rows created since the start of the
  current calendar month — fine at moderate scale; move to a counter/Redis
  if request volume gets very high.
- API keys are stored in plaintext in the database for simplicity of the
  MVP; consider hashing them (like Stripe does) before a public launch if
  that matters for your threat model.
- Passwords are hashed with bcrypt; sessions are HMAC-signed cookies (no
  server-side session store needed).

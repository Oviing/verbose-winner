import Link from "next/link";

const SAMPLE_REQUEST = `curl https://extractly.dev/api/extract \\
  -H "Authorization: Bearer $EXTRACTLY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/some-article"}'`;

const SAMPLE_RESPONSE = `{
  "title": "Some Article",
  "byline": "Jane Doe",
  "excerpt": "A short summary...",
  "markdown": "# Some Article\\n\\nClean, LLM-ready markdown...",
  "usage": { "used": 12, "limit": 5000, "plan": "STARTER" }
}`;

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Turn any webpage into clean Markdown, with one API call.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
          Extractly strips ads, navs, and boilerplate — and hands your AI agent, RAG
          pipeline, or research tool the readable content it actually needs.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-emerald-500 px-6 py-3 font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            Get your free API key
          </Link>
          <Link
            href="/docs"
            className="rounded-md border border-neutral-700 px-6 py-3 font-semibold text-neutral-100 hover:border-neutral-500"
          >
            Read the docs
          </Link>
        </div>
        <p className="mt-4 text-sm text-neutral-500">
          100 free requests / month. No credit card required.
        </p>
      </section>

      <section className="grid gap-6 pb-24 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Request
          </p>
          <pre className="overflow-x-auto text-sm text-emerald-300">
            <code>{SAMPLE_REQUEST}</code>
          </pre>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Response
          </p>
          <pre className="overflow-x-auto text-sm text-neutral-300">
            <code>{SAMPLE_RESPONSE}</code>
          </pre>
        </div>
      </section>

      <section className="grid gap-8 border-t border-neutral-800 py-20 sm:grid-cols-3">
        <Feature
          title="Built for LLMs"
          body="Clean Markdown output, sized and structured for context windows — no more feeding raw HTML to your models."
        />
        <Feature
          title="Readability-grade extraction"
          body="Uses the same content-extraction engine behind Firefox Reader View, tuned for articles, docs, and blog posts."
        />
        <Feature
          title="Simple, usage-based pricing"
          body="Start free. Upgrade in seconds as your agent scales — no infrastructure to manage on your end."
        />
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-semibold text-neutral-100">{title}</h3>
      <p className="mt-2 text-sm text-neutral-400">{body}</p>
    </div>
  );
}

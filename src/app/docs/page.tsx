export const metadata = { title: "Docs — Extractly" };

const CURL = `curl https://extractly.dev/api/extract \\
  -H "Authorization: Bearer $EXTRACTLY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/some-article"}'`;

const JS = `const res = await fetch("https://extractly.dev/api/extract", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.EXTRACTLY_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ url: "https://example.com/some-article" }),
});

const { markdown, title } = await res.json();`;

const PYTHON = `import os, requests

res = requests.post(
    "https://extractly.dev/api/extract",
    headers={"Authorization": f"Bearer {os.environ['EXTRACTLY_API_KEY']}"},
    json={"url": "https://example.com/some-article"},
)
data = res.json()
print(data["markdown"])`;

const RESPONSE_SHAPE = `{
  "url": "https://example.com/some-article",
  "title": "Some Article",
  "byline": "Jane Doe" | null,
  "excerpt": "Short summary..." | null,
  "markdown": "# Some Article\\n\\n...",
  "html": "<article>...</article>",
  "length": 4213,
  "usage": { "used": 12, "limit": 5000, "plan": "STARTER" }
}`;

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-emerald-300">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">API Documentation</h1>
      <p className="mt-3 text-neutral-400">
        One endpoint. Send a URL, get back clean Markdown. Grab an API key from your{" "}
        <a href="/dashboard" className="text-emerald-400 hover:underline">
          dashboard
        </a>
        .
      </p>

      <h2 className="mt-10 text-xl font-semibold">Authentication</h2>
      <p className="mt-2 text-neutral-400">
        Pass your API key as a bearer token in the <code>Authorization</code> header.
      </p>

      <h2 className="mt-10 text-xl font-semibold">POST /api/extract</h2>
      <p className="mt-2 text-neutral-400">Body: <code>{`{ "url": "<absolute http(s) URL>" }`}</code></p>

      <h3 className="mt-6 text-sm font-medium uppercase tracking-wide text-neutral-500">cURL</h3>
      <div className="mt-2"><Code>{CURL}</Code></div>

      <h3 className="mt-6 text-sm font-medium uppercase tracking-wide text-neutral-500">
        JavaScript / TypeScript
      </h3>
      <div className="mt-2"><Code>{JS}</Code></div>

      <h3 className="mt-6 text-sm font-medium uppercase tracking-wide text-neutral-500">Python</h3>
      <div className="mt-2"><Code>{PYTHON}</Code></div>

      <h2 className="mt-10 text-xl font-semibold">Response</h2>
      <div className="mt-2"><Code>{RESPONSE_SHAPE}</Code></div>

      <h2 className="mt-10 text-xl font-semibold">Errors &amp; limits</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-400">
        <li><code>401</code> — missing or invalid API key.</li>
        <li><code>429</code> — monthly request limit reached for your plan; upgrade on the <a href="/pricing" className="text-emerald-400 hover:underline">pricing page</a>.</li>
        <li><code>400/415/422</code> — the target URL was invalid, non-HTML, or had no extractable article content.</li>
        <li><code>502/504</code> — the target site failed to respond or timed out (15s limit).</li>
      </ul>
    </div>
  );
}

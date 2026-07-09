import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

export class ExtractError extends Error {
  status: number;
  constructor(message: string, status = 422) {
    super(message);
    this.status = status;
  }
}

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB cap

function assertPublicHttpUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ExtractError("`url` must be a valid absolute URL", 400);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ExtractError("Only http/https URLs are supported", 400);
  }
  const hostname = url.hostname.toLowerCase();
  const blocked = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "169.254.169.254", // cloud metadata endpoint
  ];
  if (
    blocked.includes(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  ) {
    throw new ExtractError("URL host is not allowed", 400);
  }
  return url;
}

export interface ExtractResult {
  url: string;
  title: string | null;
  byline: string | null;
  excerpt: string | null;
  markdown: string;
  html: string;
  length: number;
}

export async function extractFromUrl(rawUrl: string): Promise<ExtractResult> {
  const url = assertPublicHttpUrl(rawUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "ExtractlyBot/1.0 (+https://extractly.dev)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new ExtractError("Timed out fetching the URL", 504);
    }
    throw new ExtractError(`Failed to fetch URL: ${(err as Error).message}`, 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new ExtractError(`Upstream returned HTTP ${res.status}`, 502);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("html")) {
    throw new ExtractError(`Unsupported content-type: ${contentType || "unknown"}`, 415);
  }

  const contentLength = res.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BYTES) {
    throw new ExtractError("Document too large", 413);
  }

  const html = await res.text();
  if (html.length > MAX_BYTES) {
    throw new ExtractError("Document too large", 413);
  }

  const dom = new JSDOM(html, { url: url.toString() });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.content) {
    throw new ExtractError("Could not extract readable content from this page", 422);
  }

  const markdown = turndown.turndown(article.content);

  return {
    url: url.toString(),
    title: article.title ?? null,
    byline: article.byline ?? null,
    excerpt: article.excerpt ?? null,
    markdown,
    html: article.content,
    length: markdown.length,
  };
}

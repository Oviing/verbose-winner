import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Extractly — Clean Markdown from any URL, via API",
  description:
    "Turn any webpage into clean, LLM-ready Markdown with a single API call. Built for AI agents, RAG pipelines, and content tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-800 py-8 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} Extractly. Built for developers.
        </footer>
      </body>
    </html>
  );
}

import Link from "next/link";
import { getSessionUserId } from "@/lib/session";

export default async function Nav() {
  const userId = await getSessionUserId();

  return (
    <header className="border-b border-neutral-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Extract<span className="text-emerald-400">ly</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-neutral-300">
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="/docs" className="hover:text-white">
            Docs
          </Link>
          {userId ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-emerald-500 px-3 py-1.5 font-medium text-neutral-950 hover:bg-emerald-400"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-white">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-emerald-500 px-3 py-1.5 font-medium text-neutral-950 hover:bg-emerald-400"
              >
                Get API key
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

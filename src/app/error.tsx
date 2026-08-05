"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 text-center">
      <h2 className="font-serif text-3xl text-creme mb-4">Something went wrong</h2>
      <p className="text-ash text-sm mb-8 max-w-md">
        We apologize for the inconvenience. Please try again or return to the store.
      </p>
      {/* Temporary diagnostic output — remove once the /admin crash is root-caused. */}
      <div className="max-w-lg mb-8 text-left bg-black/30 border border-red-500/20 rounded-sm p-4 text-red-200 text-xs font-mono break-words whitespace-pre-wrap">
        <p className="mb-1"><strong>message:</strong> {error?.message || "(no message)"}</p>
        {error?.digest && <p className="mb-1"><strong>digest:</strong> {error.digest}</p>}
        {error?.stack && <p className="mt-2 opacity-70">{error.stack}</p>}
      </div>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-creme text-obsidian text-xs tracking-[0.2em] uppercase cursor-pointer hover:bg-primary hover:text-creme transition-all duration-300"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-ash/20 text-ash text-xs tracking-[0.2em] uppercase cursor-pointer hover:text-creme hover:border-creme transition-all duration-300"
        >
          Return to Store
        </Link>
      </div>
    </div>
  );
}

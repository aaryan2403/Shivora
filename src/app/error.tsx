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

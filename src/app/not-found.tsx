import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 text-center">
      <h2 className="font-serif text-5xl text-creme mb-4">404</h2>
      <p className="text-ash text-sm mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 border border-ash/20 text-ash text-xs tracking-[0.2em] uppercase cursor-pointer hover:text-creme hover:border-creme transition-all duration-300"
      >
        Return to Store
      </Link>
    </div>
  );
}

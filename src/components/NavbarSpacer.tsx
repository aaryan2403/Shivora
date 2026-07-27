"use client";

import { usePathname } from "next/navigation";

export default function NavbarSpacer() {
  const pathname = usePathname();
  // The announcement bar (h-8) is fixed on every page, so even the home page,
  // whose hero sits under the navbar, needs to clear it.
  if (pathname === "/") return <div className="h-8" />;
  return <div className="h-24" />;
}

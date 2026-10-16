"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESTINATION_BY_ID, type DestinationId } from "./destinations";
import { readReturnIsland } from "@/lib/explorationReturn";

/** Offers a return journey from any internal portfolio page reached by sea. */
export default function ReturnToIsland() {
  const pathname = usePathname();
  const [origin, setOrigin] = useState<DestinationId | null>(null);
  useEffect(() => {
    setOrigin(readReturnIsland());
  }, [pathname]);
  if (!origin || pathname === "/") return null;
  const destination = DESTINATION_BY_ID.get(origin);
  if (!destination) return null;
  return (
    <aside className="pointer-events-none fixed bottom-5 right-5 z-50 max-w-[calc(100vw-2.5rem)]">
      <Link
        href="/?explore=return"
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-cyan-300/40 bg-[#092839] px-4 py-3 text-sm font-semibold text-white shadow-xl transition-colors hover:bg-[#16465a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
      >
        <span aria-hidden="true">↶</span>
        Return to {destination.name}
      </Link>
    </aside>
  );
}

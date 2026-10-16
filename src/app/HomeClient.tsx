"use client";

import dynamic from "next/dynamic";

const OpenWater = dynamic(() => import("@/components/open-water/OpenWater"), {
  ssr: false,
  loading: () => (
    <main className="ow-root flex min-h-[100svh] items-center justify-center">
      <p className="ow-eyebrow animate-pulse">Making way…</p>
    </main>
  ),
});

export default function HomeClient() {
  return <OpenWater />;
}

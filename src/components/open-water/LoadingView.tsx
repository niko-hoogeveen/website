"use client";

import PageParticles from "@/components/Particles";

/**
 * Keep both the Next.js chunk loader and the portfolio preference loader
 * visually consistent with the original black/particle homepage.
 */
export default function LoadingView() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-label="Loading the portfolio"
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0a0a0a] text-[#d3d1d1]"
    >
      <PageParticles id="making-way-particles" />
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
        <p className="text-sm font-medium tracking-[0.18em] text-gray-300 motion-safe:animate-pulse">
          Making way…
        </p>
        <div aria-hidden="true" className="h-px w-16 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
      </div>
    </main>
  );
}

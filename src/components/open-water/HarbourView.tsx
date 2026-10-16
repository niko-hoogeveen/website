"use client";

import Header from "@/components/Header";
import Experiences from "@/components/Experiences";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Footer from "@/components/Footer";
import SiteNav from "@/components/SiteNav";
import PageParticles from "@/components/Particles";

interface HarbourViewProps {
  onEnterWater?: () => void;
  reason?: "choice" | "unsupported" | "reduced-motion";
}

/**
 * Original portfolio homepage from next-js-branch, with an optional entry
 * point to the interactive boat experience. Selection is owned by OpenWater.
 */
export default function HarbourView({
  onEnterWater,
  reason = "choice",
}: HarbourViewProps) {
  return (
    <div className="relative isolate min-h-[100svh] bg-[#0a0a0a] text-[#d3d1d1]">
      <main className="relative mx-auto mt-5 max-w-4xl p-4">
        {reason !== "reduced-motion" && (
          <PageParticles id="classic-home-particles" />
        )}

        <SiteNav currentPath="/" />

        {onEnterWater && (
          <section
            aria-label="Explore the interactive portfolio"
            className="mb-8 flex flex-col gap-4 rounded-xl border border-cyan-800/60 bg-[#102b34]/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-white">
                There is another way to explore.
              </p>
              <p className="mt-1 text-sm text-gray-300">
                Take the helm and visit each part of my portfolio by boat.
              </p>
            </div>
            <button
              type="button"
              onClick={onEnterWater}
              className="shrink-0 rounded-lg border border-cyan-300/40 bg-cyan-500/20 px-5 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              Launch 3D experience <span aria-hidden="true">→</span>
            </button>
          </section>
        )}

        {reason === "unsupported" && (
          <p role="status" className="mb-6 text-sm text-amber-200">
            Your browser couldn't start the 3D experience. You can still use
            every portfolio section below.
          </p>
        )}
        {reason === "reduced-motion" && (
          <p role="status" className="mb-6 text-sm text-gray-400">
            The 3D experience is paused because you prefer reduced motion.
            You can launch it manually using the button above.
          </p>
        )}

        <div className="animate-slide-in-top">
          <Header />
        </div>
        <div className="animate-slide-in-bottom">
          <hr className="my-8 border-gray-800" />
          <Experiences />
          <hr className="my-8 border-gray-800" />
          <Education />
          <hr className="my-8 border-gray-800" />
          <Projects />
          <Footer />
        </div>
      </main>
    </div>
  );
}

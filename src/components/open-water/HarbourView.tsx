"use client";

import Link from "next/link";
import { DESTINATIONS } from "./destinations";
import { NAV_ITEMS } from "@/lib/seo";

interface HarbourViewProps {
  /** Offered only when the 3D experience can actually run. */
  onEnterWater?: () => void;
  reason?: "choice" | "unsupported" | "reduced-motion";
}

/**
 * The non-interactive route through the same content. This is the page people
 * get when WebGL is unavailable, when they prefer reduced motion, or when they
 * simply want the portfolio without driving a boat.
 */
export default function HarbourView({ onEnterWater, reason = "choice" }: HarbourViewProps) {
  return (
    <main className="ow-root min-h-[100svh] bg-[radial-gradient(120%_90%_at_50%_-10%,#15384c_0%,#07202e_42%,#04131d_100%)]">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8 sm:py-20">
        <header className="ow-fade">
          <p className="ow-eyebrow">Niko Hoogeveen · Toronto, Ontario</p>
          <h1 className="mt-4 text-4xl font-light leading-[1.05] tracking-tight sm:text-6xl">
            The Open Water
            <span className="text-[var(--ow-turquoise)]">.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--ow-mist)]">
            Software engineer, Coast Guard search-and-rescue coxswain, and a life
            spent close to the water.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {onEnterWater && (
              <button type="button" className="ow-button ow-button--primary" onClick={onEnterWater}>
                Enter the water
                <span aria-hidden="true">→</span>
              </button>
            )}
            <Link href="/projects" className="ow-button">
              Projects
            </Link>
            <Link href="/resume" className="ow-button">
              Résumé
            </Link>
          </div>

          {reason === "unsupported" && (
            <p className="mt-5 max-w-xl text-[12.5px] leading-relaxed text-[var(--ow-sun)]">
              Your browser could not start WebGL, so the interactive chart is
              unavailable. Everything below links to the same content.
            </p>
          )}
          {reason === "reduced-motion" && (
            <p className="mt-5 max-w-xl text-[12.5px] leading-relaxed text-[var(--ow-mist)]/80">
              You have asked for reduced motion, so the animated chart is off by
              default. You can still enter the water if you would like to.
            </p>
          )}
        </header>

        <section className="mt-14" aria-labelledby="ow-destinations">
          <h2 id="ow-destinations" className="ow-eyebrow">
            Destinations
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {DESTINATIONS.map((d) => (
              <li key={d.id}>
                <Link
                  href={d.href}
                  className="ow-panel group flex h-full flex-col p-5 transition-colors hover:border-[rgba(116,214,206,0.45)]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[10px] tracking-[0.2em]"
                      style={{ color: d.accent }}
                    >
                      {d.marker}
                    </span>
                    <span className="ow-eyebrow">{d.subtitle}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-light tracking-tight">{d.name}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--ow-mist)]/85">
                    {d.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--ow-turquoise)]">
                    {d.links[0]?.label ?? "Open"}
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav className="mt-14 border-t border-[var(--ow-line)] pt-6" aria-label="All pages">
          <h2 className="ow-eyebrow">Everything else</h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.description}
                  className="text-[13px] text-[var(--ow-mist)]/80 underline-offset-4 transition-colors hover:text-[var(--ow-foam)] hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}

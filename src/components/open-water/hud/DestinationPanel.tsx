"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Destination } from "../destinations";

interface DestinationPanelProps {
  destination: Destination;
  onClose: () => void;
  onNavigate: () => void;
  onNextIsland: () => void;
}

/**
 * The reward for exploring: a full briefing on the destination the visitor has
 * just reached, with a direct route into the matching portfolio page.
 */
export default function DestinationPanel({ destination, onClose, onNavigate, onNextIsland }: DestinationPanelProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = panel.current;
    if (!node) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="false"
      aria-labelledby="ow-destination-title"
      className="ow-panel ow-rise pointer-events-auto flex max-h-[min(78vh,640px)] w-full flex-col overflow-hidden sm:w-[420px]"
    >
      <div
        className="h-[3px] w-full shrink-0"
        style={{ background: `linear-gradient(90deg, ${destination.accent}, transparent)` }}
      />
      <div className="ow-scroll overflow-y-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] tracking-[0.2em]"
            style={{ color: destination.accent }}
          >
            {destination.marker}
          </span>
          <span className="ow-eyebrow">{destination.subtitle}</span>
        </div>

        <h2
          id="ow-destination-title"
          ref={heading}
          tabIndex={-1}
          className="mt-2 text-[27px] font-light leading-tight tracking-tight outline-none"
        >
          {destination.name}
        </h2>

        <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--ow-mist)]">
          {destination.summary}
        </p>

        <ul className="mt-5 space-y-2.5 border-t border-[var(--ow-line)] pt-5">
          {destination.highlights.map((item) => (
            <li key={item} className="flex gap-3 text-[12.5px] leading-relaxed">
              <span
                aria-hidden="true"
                className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full"
                style={{ background: destination.accent }}
              />
              <span className="text-[var(--ow-mist)]">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {destination.links.map((link, index) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`ow-button${index === 0 ? " ow-button--primary" : ""}`}
              >
                {link.label}
                <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`ow-button${index === 0 ? " ow-button--primary" : ""}`}
              >
                {link.label}
                <span aria-hidden="true">→</span>
              </Link>
            ),
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--ow-line)] px-6 py-3">
        <button type="button" className="ow-button" onClick={onClose}>
          Return to the water [E]
        </button>
        <button type="button" className="ow-button ow-button--primary" onClick={onNextIsland}>
          Next island <span aria-hidden="true">→</span>
        </button>
        <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-[var(--ow-mist)]/60 sm:flex">
          <kbd className="ow-key">Esc</kbd>
        </span>
      </div>
    </div>
  );
}

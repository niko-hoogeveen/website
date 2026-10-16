"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/seo";

interface NavMenuProps {
  onOpenChange?: (open: boolean) => void;
}

/** Glass navigation menu. Every portfolio route stays one click away. */
export default function NavMenu({ onOpenChange }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    onOpenChange?.(open);
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={container} className="pointer-events-auto relative flex items-center gap-2">
      <button
        type="button"
        className="ow-button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex h-3 w-3.5 flex-col justify-between" aria-hidden="true">
          <span className="block h-px w-full bg-current" />
          <span className="block h-px w-full bg-current" />
          <span className="block h-px w-full bg-current" />
        </span>
        Menu
      </button>

      {open && (
        <div
          id={panelId}
          className="ow-panel ow-rise absolute right-0 top-[calc(100%+0.6rem)] w-[270px] p-2"
        >
          <p className="ow-eyebrow px-3 pb-1 pt-2">Portfolio</p>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  <span className="block text-[13px] font-medium">{item.label}</span>
                  <span className="block text-[11px] leading-snug text-[var(--ow-mist)]/65">
                    {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

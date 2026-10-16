"use client";

import { useCallback, useEffect, useState } from "react";

export type PortfolioMode = "classic" | "interactive";
export type ClassicReason = "choice" | "unsupported" | "reduced-motion";

const STORAGE_KEY = "open-water:preferred-home:v1";

function readPreference(): PortfolioMode | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "classic" || value === "interactive" ? value : null;
  } catch {
    return null;
  }
}

function savePreference(mode: PortfolioMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // The current-page choice still works when storage is blocked.
  }
}

/** Maintains a single homepage preference across routes and browser history. */
export function usePortfolioView() {
  const [mode, setMode] = useState<PortfolioMode | null>(null);
  const [reason, setReason] = useState<ClassicReason>("choice");

  const syncPreference = useCallback(() => {
    const saved = readPreference();
    if (saved) {
      setMode(saved);
      setReason("choice");
      return;
    }
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(reducedMotion ? "classic" : "interactive");
    setReason(reducedMotion ? "reduced-motion" : "choice");
  }, []);

  useEffect(() => {
    syncPreference();
    // pageshow handles back-forward cache restores; popstate handles history.
    // storage handles the preference changing in another tab.
    window.addEventListener("pageshow", syncPreference);
    window.addEventListener("popstate", syncPreference);
    window.addEventListener("storage", syncPreference);
    const motion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    motion?.addEventListener?.("change", syncPreference);
    return () => {
      window.removeEventListener("pageshow", syncPreference);
      window.removeEventListener("popstate", syncPreference);
      window.removeEventListener("storage", syncPreference);
      motion?.removeEventListener?.("change", syncPreference);
    };
  }, [syncPreference]);

  const chooseClassic = useCallback(() => {
    savePreference("classic");
    setReason("choice");
    setMode("classic");
  }, []);

  const chooseInteractive = useCallback(() => {
    savePreference("interactive");
    setReason("choice");
    setMode("interactive");
  }, []);

  const markUnsupported = useCallback(() => {
    // A WebGL failure is not a deliberate preference: don't persist it.
    setReason("unsupported");
    setMode("classic");
  }, []);

  return { mode, reason, chooseClassic, chooseInteractive, markUnsupported };
}

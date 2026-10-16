"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createWorld, type Phase, type Telemetry, type WorldHandle } from "./engine/world";
import { startAmbientAudio, type AmbientAudio } from "./engine/audio";
import { DESTINATIONS, DESTINATION_BY_ID, type DestinationId } from "./destinations";
import HarbourView from "./HarbourView";
import NavMenu from "./hud/NavMenu";
import DestinationPanel from "./hud/DestinationPanel";
import TouchControls from "./hud/TouchControls";
import { Instruments, type InstrumentHandle } from "./hud/Instruments";
import { usePortfolioView } from "@/lib/usePortfolioView";
import { readReturnIsland, clearReturnIsland, rememberIsland } from "@/lib/explorationReturn";
import LoadingView from "./LoadingView";

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export default function OpenWater() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<WorldHandle | null>(null);
  const instrumentsRef = useRef<InstrumentHandle>(null);
  const labelRefs = useRef(new Map<DestinationId, HTMLElement | null>());
  const audioRef = useRef<AmbientAudio | null>(null);

  const { mode, reason, chooseClassic, chooseInteractive, markUnsupported } = usePortfolioView();
  const [phase, setPhase] = useState<Phase>("intro");
  const [nearId, setNearId] = useState<DestinationId | null>(null);
  const [dockedId, setDockedId] = useState<DestinationId | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const pendingReturn = useRef<DestinationId | null>(null);

  // Honor the visitor's saved preference before creating any WebGL context.
  useEffect(() => {
    if (mode === "interactive" && !webglAvailable()) markUnsupported();
  }, [mode, markUnsupported]);

  const getLabel = useCallback(
    (id: DestinationId) => labelRefs.current.get(id) ?? null,
    [],
  );

  const onTelemetry = useCallback((telemetry: Telemetry) => {
    instrumentsRef.current?.update(telemetry);
    audioRef.current?.setPower(telemetry.power);
  }, []);

  const onPhaseChange = useCallback((next: Phase, docked: DestinationId | null) => {
    setPhase(next);
    setDockedId(docked);
  }, []);

  useEffect(() => {
    if (mode !== "interactive") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let world: WorldHandle | null = null;
    try {
      world = createWorld(
        canvas,
        {
          onTelemetry,
          onNearChange: setNearId,
          onPhaseChange,
          onEngage: () => setEngaged(true),
          getLabel,
        },
        false,
      );
    } catch (error) {
      console.error("[OpenWater] unable to start the 3D scene", error);
      markUnsupported();
      return;
    }

    worldRef.current = world;
    const returning = pendingReturn.current;
    if (returning) {
      pendingReturn.current = null;
      world.travelTo(returning);
    }
    return () => {
      worldRef.current = null;
      world?.dispose();
    };
  }, [mode, onTelemetry, onPhaseChange, getLabel, markUnsupported]);

  useEffect(() => {
    return () => {
      audioRef.current?.stop();
      audioRef.current = null;
    };
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      if (on) {
        audioRef.current?.stop();
        audioRef.current = null;
        return false;
      }
      audioRef.current = startAmbientAudio();
      return audioRef.current !== null;
    });
  }, []);

  const handleTouch = useCallback((throttle: number, steer: number) => {
    worldRef.current?.setTouch(throttle, steer);
  }, []);

  useEffect(() => {
    // A page link records its originating island. Only an explicit return
    // navigates back to it, keeping normal Home behaviour unchanged.
    const params = new URLSearchParams(window.location.search);
    if (params.get("explore") !== "return") return;
    const id = readReturnIsland();
    if (!id) return;
    pendingReturn.current = id;
    chooseInteractive();
    clearReturnIsland();
    // Don't leave a return command in the URL for later refreshes.
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.hash);
  }, [chooseInteractive]);

  const fastTravel = useCallback((id: DestinationId) => {
    worldRef.current?.travelTo(id);
  }, []);

  const nextIsland = useCallback(() => {
    const current = dockedId ?? nearId;
    const index = DESTINATIONS.findIndex((destination) => destination.id === current);
    const next = DESTINATIONS[(index + 1) % DESTINATIONS.length];
    fastTravel(next.id);
  }, [dockedId, nearId, fastTravel]);

  const enterHarbour = useCallback(() => {
    worldRef.current?.setPaused(true);
    audioRef.current?.stop();
    audioRef.current = null;
    setSoundOn(false);
    chooseClassic();
  }, [chooseClassic]);

  const enterWater = useCallback(() => {
    setEngaged(false);
    setPhase("intro");
    setNearId(null);
    setDockedId(null);
    chooseInteractive();
  }, [chooseInteractive]);

  if (mode === null) return <LoadingView />;

  if (mode === "classic") {
    return (
      <HarbourView
        reason={reason}
        onEnterWater={reason === "unsupported" ? undefined : enterWater}
      />
    );
  }

  const near = nearId ? DESTINATION_BY_ID.get(nearId) : undefined;
  const docked = dockedId ? DESTINATION_BY_ID.get(dockedId) : undefined;

  return (
    <main className="ow-root relative h-[100svh] min-h-[520px] w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        aria-label="Interactive 3D chart of a coastal world with five portfolio destinations"
        role="img"
      />

      {/* Depth grading over the render, top and bottom. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#04131d73] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#04131d8c] to-transparent"
      />

      {/* Floating world labels, positioned by the engine. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {DESTINATIONS.map((d) => (
          <div
            key={d.id}
            ref={(node) => {
              labelRefs.current.set(d.id, node);
            }}
            className="ow-label"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <div className="flex flex-col items-center">
              <span
                className="h-2 w-2 rounded-full ring-4"
                style={{ background: d.accent, boxShadow: `0 0 12px ${d.accent}` }}
              />
              <span className="mt-2 h-6 w-px bg-white/35" />
              <span className="mt-1 whitespace-nowrap rounded-full border border-white/15 bg-[#04131dad] px-3 py-1 text-[11px] font-medium tracking-wide backdrop-blur-sm">
                {d.name}
                <span className="ml-2 font-mono text-[9px] tracking-[0.16em] text-[var(--ow-mist)]/70">
                  {d.marker}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 sm:p-7">
        <div className="ow-fade">
          <p className="ow-eyebrow">Niko Hoogeveen</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="ow-button pointer-events-auto" onClick={enterHarbour}>
            Skip exploration
          </button>
          <NavMenu />
        </div>
      </header>

      {/* Always-available direct navigation; Next island lives in the briefing panel. */}
      <nav aria-label="Fast travel" className="pointer-events-auto absolute left-5 top-20 z-10 flex max-w-[calc(100vw-2.5rem)] flex-wrap items-center gap-2 sm:left-7 sm:top-20">
        <label htmlFor="ow-fast-travel" className="ow-eyebrow">
          Fast travel
        </label>
        <select
          id="ow-fast-travel"
          value={dockedId ?? ""}
          onChange={(event) => {
            const id = event.target.value as DestinationId;
            if (DESTINATIONS.some((item) => item.id === id)) fastTravel(id);
          }}
          className="ow-button max-w-[190px] cursor-pointer bg-[#0c2636] text-white"
        >
          <option value="">Choose island…</option>
          {DESTINATIONS.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </nav>

      {/* Bottom-left instruments */}
      <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
        <Instruments ref={instrumentsRef} activeId={nearId} />
        <div className="pointer-events-auto mt-3 flex items-center gap-2">
          <button
            type="button"
            className="ow-button"
            onClick={() => worldRef.current?.reset()}
            title="Return the boat to the start"
          >
            <span aria-hidden="true">⟲</span>
            Reset
          </button>
          <button
            type="button"
            className="ow-button"
            onClick={toggleSound}
            aria-pressed={soundOn}
          >
            <span aria-hidden="true">{soundOn ? "◉" : "○"}</span>
            {soundOn ? "Sound on" : "Sound off"}
          </button>
        </div>
      </div>

      {/* Bottom-right context */}
      <div className="pointer-events-none absolute bottom-5 right-5 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
        {phase !== "docked" && near && (
          <div className="ow-panel ow-rise pointer-events-auto flex items-center gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: near.accent, boxShadow: `0 0 10px ${near.accent}` }}
            />
            <div className="min-w-0">
              <p className="ow-eyebrow">Approaching</p>
              <p className="mt-0.5 truncate text-[13px] font-medium">{near.name}</p>
            </div>
            <button
              type="button"
              className="ow-button ow-button--primary shrink-0"
              onClick={() => worldRef.current?.dock()}
            >
              <kbd className="ow-key hidden sm:inline-flex">E</kbd>
              Go ashore
            </button>
          </div>
        )}

        {phase !== "docked" && !near && (
          <div className="ow-panel hidden items-center gap-4 px-4 py-2.5 md:flex">
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--ow-mist)]/75">
              <kbd className="ow-key">W</kbd>
              <kbd className="ow-key">A</kbd>
              <kbd className="ow-key">S</kbd>
              <kbd className="ow-key">D</kbd>
              Steer
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--ow-mist)]/75">
              <kbd className="ow-key">E</kbd>
              Go ashore
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--ow-mist)]/75">
              <kbd className="ow-key">R</kbd>
              Reset
            </span>
          </div>
        )}

        <TouchControls onInput={handleTouch} />
      </div>

      {/* Destination briefing */}
      {docked && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4 sm:items-center sm:justify-end sm:p-8">
          <DestinationPanel
            destination={docked}
            onNavigate={() => rememberIsland(docked.id)}
            onClose={() => worldRef.current?.undock()}
            onNextIsland={nextIsland}
          />
        </div>
      )}

      {/* Opening titles */}
      {phase === "intro" && !engaged && (
        <div className="ow-fade pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-[#04131d66] px-6 text-center">
          <p className="ow-eyebrow">An interactive portfolio</p>
          <h2 className="mt-4 max-w-2xl text-[34px] font-light leading-[1.08] tracking-tight sm:text-[54px]">
            Take the helm and find
            <br className="hidden sm:block" /> the five destinations
            <span className="text-[var(--ow-turquoise)]">.</span>
          </h2>
          <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-[var(--ow-mist)]">
            Software engineering, search and rescue, and a life spent close to the
            water - each island holds a different part of the story.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="ow-panel flex items-center gap-2 px-4 py-2.5 text-[12.5px]">
              <kbd className="ow-key">W</kbd>
              <span className="text-[var(--ow-mist)]">to get underway</span>
            </span>
            <button type="button" className="ow-button" onClick={enterHarbour}>
              Skip exploration
            </button>
          </div>
          <p className="mt-6 text-[11px] text-[var(--ow-mist)]/55 md:hidden">
            Use the on-screen controls to steer.
          </p>
        </div>
      )}

      {/* Keyboard-only route to every page, always in the tab order. */}
      <nav aria-label="Destinations" className="sr-only">
        <ul>
          {DESTINATIONS.map((d) => (
            <li key={d.id}>
              <Link href={d.href}>
                {d.name} - {d.subtitle}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}

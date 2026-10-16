"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { Telemetry } from "../engine/world";
import { DESTINATIONS, WORLD_RADIUS } from "../destinations";

export interface InstrumentHandle {
  update: (telemetry: Telemetry) => void;
}

const CHART_RADIUS = 58;
const CHART_SCALE = CHART_RADIUS / WORLD_RADIUS;

/**
 * Heading, speed and a north-up chart. The engine writes straight into these
 * nodes every frame, so the instruments never trigger a React render.
 */
export const Instruments = forwardRef<
  InstrumentHandle,
  { activeId: string | null }
>(function Instruments({ activeId }, ref) {
  const heading = useRef<HTMLSpanElement>(null);
  const knots = useRef<HTMLSpanElement>(null);
  const range = useRef<HTMLSpanElement>(null);
  const power = useRef<HTMLDivElement>(null);
  const vessel = useRef<SVGGElement>(null);
  const warning = useRef<HTMLParagraphElement>(null);

  useImperativeHandle(ref, () => ({
    update(telemetry) {
      if (heading.current) {
        heading.current.textContent = Math.round(telemetry.heading)
          .toString()
          .padStart(3, "0");
      }
      if (knots.current) knots.current.textContent = telemetry.knots.toFixed(1);
      if (range.current) {
        range.current.textContent =
          telemetry.range > 999 ? "—" : `${Math.round(telemetry.range)} m`;
      }
      if (power.current) {
        power.current.style.transform = `scaleX(${Math.min(1, telemetry.power *1.37).toFixed(3)})`;
      }
      if (vessel.current) {
        vessel.current.setAttribute(
          "transform",
          `translate(${(telemetry.x * CHART_SCALE).toFixed(2)} ${(telemetry.z * CHART_SCALE).toFixed(2)}) rotate(${telemetry.heading.toFixed(1)})`,
        );
      }
      if (warning.current) {
        warning.current.style.opacity = telemetry.offChart ? "1" : "0";
      }
    },
  }));

  return (
    <div className="pointer-events-none flex flex-col gap-3">
      <div className="ow-panel w-[190px] px-4 py-3 sm:w-[216px]">
        <p className="ow-eyebrow">Navigation</p>
        <div className="mt-2 flex items-baseline gap-3 font-mono">
          <span className="text-2xl font-medium tracking-tight tabular-nums" ref={heading}>
            000
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ow-mist)]/70">
            HDG
          </span>
          <span className="ml-auto text-xl font-medium tabular-nums" ref={knots}>
            0.0
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ow-mist)]/70">
            kn
          </span>
        </div>
        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/12">
          <div
            ref={power}
            className="h-full w-full origin-left rounded-full bg-[var(--ow-turquoise)]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ow-mist)]/65">
          <span>Nearest</span>
          <span ref={range} className="tabular-nums text-[var(--ow-mist)]">
            — m
          </span>
        </div>
        <p
          ref={warning}
          className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ow-sun)] transition-opacity duration-300"
          style={{ opacity: 0 }}
        >
          ⚠ Leaving charted water
        </p>
      </div>

      <div className="ow-panel hidden w-[190px] p-3 sm:w-[216px] md:block">
        <p className="ow-eyebrow mb-2">Chart</p>
        <svg
          viewBox="-70 -70 140 140"
          className="h-auto w-full"
          role="img"
          aria-label="Chart showing the boat position relative to the five destinations"
        >
          <circle r={CHART_RADIUS + 7} fill="rgba(4,19,29,0.5)" />
          <circle
            r={CHART_RADIUS}
            fill="none"
            stroke="rgba(207,226,230,0.22)"
            strokeWidth="0.8"
          />
          <circle
            r={CHART_RADIUS * 0.5}
            fill="none"
            stroke="rgba(207,226,230,0.1)"
            strokeWidth="0.6"
            strokeDasharray="2 3"
          />
          <line
            x1="0"
            y1={-CHART_RADIUS}
            x2="0"
            y2={CHART_RADIUS}
            stroke="rgba(207,226,230,0.1)"
            strokeWidth="0.6"
          />
          <line
            x1={-CHART_RADIUS}
            y1="0"
            x2={CHART_RADIUS}
            y2="0"
            stroke="rgba(207,226,230,0.1)"
            strokeWidth="0.6"
          />
          <text
            x="0"
            y={-CHART_RADIUS - 1.5}
            textAnchor="middle"
            fontSize="7"
            fill="rgba(207,226,230,0.75)"
            fontFamily="var(--font-mono, monospace)"
          >
            N
          </text>

          {DESTINATIONS.map((d) => {
            const active = activeId === d.id;
            return (
              <g key={d.id} transform={`translate(${d.x * CHART_SCALE} ${d.z * CHART_SCALE})`}>
                {active && <circle r="6" fill={d.accent} opacity="0.22" />}
                <circle r={active ? 3 : 2.1} fill={d.accent} opacity={active ? 1 : 0.75} />
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  fontSize="5"
                  fill={active ? "#f4f8f7" : "rgba(207,226,230,0.6)"}
                  fontFamily="var(--font-mono, monospace)"
                >
                  {d.marker}
                </text>
              </g>
            );
          })}

          <g ref={vessel}>
            <path
              d="M0 -5 L3.4 4.2 L0 2.2 L-3.4 4.2 Z"
              fill="var(--ow-foam)"
              stroke="rgba(4,19,29,0.6)"
              strokeWidth="0.5"
            />
          </g>
        </svg>
      </div>
    </div>
  );
});

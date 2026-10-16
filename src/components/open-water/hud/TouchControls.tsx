"use client";

import { useCallback, useEffect, useRef } from "react";

interface TouchControlsProps {
  onInput: (throttle: number, steer: number) => void;
}

type Axis = "throttle" | "steer";

/**
 * Press-and-hold controls for touch devices. Pointer capture keeps a control
 * active if the finger slides, and every pointer is released on unmount so the
 * boat can never be left stuck at full throttle.
 */
export default function TouchControls({ onInput }: TouchControlsProps) {
  const state = useRef({ throttle: 0, steer: 0 });

  const push = useCallback(() => {
    onInput(state.current.throttle, state.current.steer);
  }, [onInput]);

  useEffect(() => {
    return () => onInput(0, 0);
  }, [onInput]);

  const bind = (axis: Axis, value: number) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      state.current[axis] = value;
      push();
    },
    onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      state.current[axis] = 0;
      push();
    },
    onPointerCancel: () => {
      state.current[axis] = 0;
      push();
    },
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  });

  const buttonClass =
    "ow-panel pointer-events-auto flex h-14 w-14 touch-none select-none items-center justify-center text-lg text-[var(--ow-foam)] active:bg-white/15";

  return (
    <div className="flex items-end gap-2 md:hidden">
      <div className="flex gap-2">
        <button type="button" aria-label="Turn to port" className={buttonClass} {...bind("steer", -1)}>
          <span aria-hidden="true">↺</span>
        </button>
        <button
          type="button"
          aria-label="Turn to starboard"
          className={buttonClass}
          {...bind("steer", 1)}
        >
          <span aria-hidden="true">↻</span>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" aria-label="Ahead" className={buttonClass} {...bind("throttle", 1)}>
          <span aria-hidden="true">▲</span>
        </button>
        <button type="button" aria-label="Astern" className={buttonClass} {...bind("throttle", -1)}>
          <span aria-hidden="true">▼</span>
        </button>
      </div>
    </div>
  );
}

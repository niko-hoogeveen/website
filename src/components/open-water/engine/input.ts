export interface InputState {
  /** -1 (astern) to 1 (ahead). */
  throttle: number;
  /** -1 (port) to 1 (starboard). */
  steer: number;
}

export interface InputHandle {
  state: InputState;
  /** True once the visitor has touched any control. */
  engaged: boolean;
  setTouch: (throttle: number, steer: number) => void;
  dispose: () => void;
}

const THROTTLE_KEYS: Record<string, number> = {
  KeyW: 1,
  ArrowUp: 1,
  KeyS: -1,
  ArrowDown: -1,
};

const STEER_KEYS: Record<string, number> = {
  KeyD: 1,
  ArrowRight: 1,
  KeyA: -1,
  ArrowLeft: -1,
};

export interface InputCallbacks {
  onDock: () => void;
  onReset: () => void;
  onCancel: () => void;
  onEngage: () => void;
}

/**
 * Keyboard and touch input. Arrow keys are swallowed only while the canvas has
 * focus semantics (no text field focused) so the page stays keyboard navigable.
 */
export function createInput(callbacks: InputCallbacks): InputHandle {
  const held = new Set<string>();
  const state: InputState = { throttle: 0, steer: 0 };
  let touchThrottle = 0;
  let touchSteer = 0;
  const handle: InputHandle = {
    state,
    engaged: false,
    setTouch(throttle, steer) {
      touchThrottle = throttle;
      touchSteer = steer;
      apply();
      if (throttle || steer) engage();
    },
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    },
  };

  function engage() {
    if (!handle.engaged) {
      handle.engaged = true;
      callbacks.onEngage();
    }
  }

  function apply() {
    let throttle = touchThrottle;
    let steer = touchSteer;
    for (const code of held) {
      throttle += THROTTLE_KEYS[code] ?? 0;
      steer += STEER_KEYS[code] ?? 0;
    }
    state.throttle = Math.max(-1, Math.min(1, throttle));
    state.steer = Math.max(-1, Math.min(1, steer));
  }

  const isTypingTarget = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  };

  function onKeyDown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;

    if (event.code === "Escape") {
      callbacks.onCancel();
      return;
    }
    if (event.code === "KeyE" || event.code === "Enter") {
      // Enter must still activate focused links and buttons.
      if (event.code === "Enter" && document.activeElement !== document.body) return;
      event.preventDefault();
      callbacks.onDock();
      return;
    }
    if (event.code === "KeyR") {
      callbacks.onReset();
      return;
    }
    if (!(event.code in THROTTLE_KEYS) && !(event.code in STEER_KEYS)) return;

    // Only capture the arrow keys when nothing focusable is being operated.
    if (event.code.startsWith("Arrow") && document.activeElement !== document.body) return;

    event.preventDefault();
    held.add(event.code);
    apply();
    engage();
  }

  function onKeyUp(event: KeyboardEvent) {
    if (held.delete(event.code)) apply();
  }

  function onBlur() {
    held.clear();
    apply();
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  return handle;
}

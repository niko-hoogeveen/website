/**
 * Optional ambient audio, synthesised at runtime — no audio assets are shipped.
 * Nothing is created until the visitor explicitly turns sound on, which also
 * satisfies browser autoplay policies.
 */

export interface AmbientAudio {
  setPower: (power: number) => void;
  stop: () => void;
}

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Pink-ish noise via a simple one-pole cascade, which reads as surf rather
  // than hiss.
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57555 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.12;
  }
  return buffer;
}

export function startAmbientAudio(): AmbientAudio | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  const ctx = new Ctor();
  void ctx.resume();

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.4);
  master.connect(ctx.destination);

  // --- surf ---------------------------------------------------------------
  const surf = ctx.createBufferSource();
  surf.buffer = noiseBuffer(ctx);
  surf.loop = true;

  const surfFilter = ctx.createBiquadFilter();
  surfFilter.type = "lowpass";
  surfFilter.frequency.value = 760;
  surfFilter.Q.value = 0.6;

  const surfGain = ctx.createGain();
  surfGain.gain.value = 0.45;

  // Slow swell: an LFO opening and closing the surf filter.
  const swell = ctx.createOscillator();
  swell.frequency.value = 0.075;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = 300;
  swell.connect(swellDepth).connect(surfFilter.frequency);

  surf.connect(surfFilter).connect(surfGain).connect(master);

  // --- outboard -----------------------------------------------------------
  const engine = ctx.createOscillator();
  engine.type = "sawtooth";
  engine.frequency.value = 42;

  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.value = 21;

  const engineFilter = ctx.createBiquadFilter();
  engineFilter.type = "lowpass";
  engineFilter.frequency.value = 220;
  engineFilter.Q.value = 3;

  const engineGain = ctx.createGain();
  engineGain.gain.value = 0;

  engine.connect(engineFilter);
  sub.connect(engineFilter);
  engineFilter.connect(engineGain).connect(master);

  surf.start();
  swell.start();
  engine.start();
  sub.start();

  let stopped = false;

  return {
    setPower(power) {
      if (stopped) return;
      const p = Math.max(0, Math.min(1, power));
      const now = ctx.currentTime;
      engine.frequency.setTargetAtTime(38 + p * 74, now, 0.25);
      sub.frequency.setTargetAtTime(19 + p * 37, now, 0.25);
      engineFilter.frequency.setTargetAtTime(180 + p * 900, now, 0.3);
      engineGain.gain.setTargetAtTime(0.02 + p * 0.1, now, 0.3);
      surfGain.gain.setTargetAtTime(0.4 + p * 0.3, now, 0.5);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.4);
      window.setTimeout(() => {
        surf.stop();
        swell.stop();
        engine.stop();
        sub.stop();
        void ctx.close();
      }, 600);
    },
  };
}

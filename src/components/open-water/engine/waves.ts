/**
 * Gerstner wave field shared by the GPU (ocean shader) and the CPU (buoyancy,
 * wake ribbon, floating props). The GLSL is generated from the same constants so
 * the simulated surface and the rendered surface can never drift apart.
 */

export interface Wave {
  /** Direction of travel in the XZ plane; normalised on construction. */
  dir: [number, number];
  /** Vertical amplitude in world units. */
  amp: number;
  /** Wavelength in world units. */
  len: number;
  /** Horizontal pinch, 0 = sine, 1 = sharp crest. */
  steep: number;
  /** Multiplier on the deep-water phase speed. */
  speed: number;
}

export const WAVES: Wave[] = [
  { dir: [1, 0.26], amp: 0.52, len: 62, steep: 0.78, speed: 0.92 },
  { dir: [-0.68, 0.73], amp: 0.32, len: 34, steep: 0.66, speed: 1.08 },
  { dir: [0.38, -0.92], amp: 0.11, len: 17.5, steep: 0.55, speed: 1.3 },
  { dir: [-0.34, -0.63], amp: 0.1, len: 8.4, steep: 0.42, speed: 1.65 },
];

const GRAVITY = 9.81;

interface Compiled {
  dx: number;
  dz: number;
  amp: number;
  k: number;
  c: number;
  steep: number;
}

const COMPILED: Compiled[] = WAVES.map((w) => {
  const n = Math.hypot(w.dir[0], w.dir[1]) || 1;
  const k = (Math.PI * 2) / w.len;
  return {
    dx: w.dir[0] / n,
    dz: w.dir[1] / n,
    amp: w.amp,
    k,
    c: Math.sqrt(GRAVITY / k) * w.speed,
    steep: w.steep,
  };
});

/** Sum of amplitudes: the theoretical crest height, used to normalise foam. */
export const WAVE_MAX_HEIGHT = COMPILED.reduce((sum, w) => sum + w.amp, 0);

const f = (n: number) => (Number.isInteger(n) ? `${n}.0` : `${n}`);

/**
 * GLSL implementation of the wave field.
 *
 * `damp` scales wave energy (used to flatten water as it shoals near land).
 * `owWaveSurface` returns the displaced position and writes the analytic normal
 * plus a normalised crest height used for foam.
 */
export function waveGLSL(): string {
  const displace = COMPILED.map(
    (w, i) => `
  float k${i} = ${f(w.k)};
  vec2 d${i} = vec2(${f(w.dx)}, ${f(w.dz)});
  float a${i} = ${f(w.amp)} * damp;
  float f${i} = k${i} * (dot(d${i}, p) - ${f(w.c)} * t);
  float s${i} = sin(f${i});
  float c${i} = cos(f${i});
  disp.y += a${i} * s${i};
  disp.xz += d${i} * (${f(w.steep)} * a${i} * c${i});
  dPdx += vec3(-${f(w.steep)} * a${i} * k${i} * d${i}.x * d${i}.x * s${i}, a${i} * k${i} * d${i}.x * c${i}, -${f(w.steep)} * a${i} * k${i} * d${i}.x * d${i}.y * s${i});
  dPdz += vec3(-${f(w.steep)} * a${i} * k${i} * d${i}.x * d${i}.y * s${i}, a${i} * k${i} * d${i}.y * c${i}, -${f(w.steep)} * a${i} * k${i} * d${i}.y * d${i}.y * s${i});`,
  ).join("\n");

  return `
const float OW_WAVE_MAX = ${f(Number(WAVE_MAX_HEIGHT.toFixed(4)))};

vec3 owWaveSurface(vec2 p, float t, float damp, out vec3 normal, out float crest) {
  vec3 disp = vec3(0.0);
  vec3 dPdx = vec3(1.0, 0.0, 0.0);
  vec3 dPdz = vec3(0.0, 0.0, 1.0);
${displace}
  normal = normalize(cross(dPdz, dPdx));
  crest = clamp(disp.y / max(OW_WAVE_MAX * damp, 0.0001), -1.0, 1.0);
  return disp;
}
`;
}

export interface WaterSample {
  height: number;
  normalX: number;
  normalY: number;
  normalZ: number;
}

const scratch: WaterSample = { height: 0, normalX: 0, normalY: 1, normalZ: 0 };

/**
 * CPU evaluation of the same field. Writes into a module-level scratch object to
 * keep the physics step allocation free.
 */
export function sampleWater(x: number, z: number, t: number, damp = 1): WaterSample {
  let height = 0;
  let ax = 1;
  let ay = 0;
  let az = 0;
  let bx = 0;
  let by = 0;
  let bz = 1;

  for (let i = 0; i < COMPILED.length; i++) {
    const w = COMPILED[i];
    const amp = w.amp * damp;
    const phase = w.k * (w.dx * x + w.dz * z - w.c * t);
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    height += amp * s;

    const qak = w.steep * amp * w.k;
    ax += -qak * w.dx * w.dx * s;
    ay += amp * w.k * w.dx * c;
    az += -qak * w.dx * w.dz * s;
    bx += -qak * w.dx * w.dz * s;
    by += amp * w.k * w.dz * c;
    bz += -qak * w.dz * w.dz * s;
  }

  // normal = normalize(cross(dPdz, dPdx))
  const nx = by * az - bz * ay;
  const ny = bz * ax - bx * az;
  const nz = bx * ay - by * ax;
  const len = Math.hypot(nx, ny, nz) || 1;

  scratch.height = height;
  scratch.normalX = nx / len;
  scratch.normalY = ny / len;
  scratch.normalZ = nz / len;
  return scratch;
}

/** Vertical displacement only — cheaper than a full sample. */
export function waterHeight(x: number, z: number, t: number, damp = 1): number {
  let height = 0;
  for (let i = 0; i < COMPILED.length; i++) {
    const w = COMPILED[i];
    height += w.amp * damp * Math.sin(w.k * (w.dx * x + w.dz * z - w.c * t));
  }
  return height;
}

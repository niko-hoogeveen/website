import * as THREE from "three";

/**
 * One palette for the 3D world and the interface so the HUD reads as part of
 * the same scene. Late-afternoon light: deep navy water, turquoise shoals,
 * warm low sun, muted coastal greens.
 */
export const PALETTE = {
  zenith: "#2f78a8",
  horizon: "#bed6d8",
  horizonLow: "#d6ddd4",
  sunTint: "#ffd9a4",
  sunLight: "#fff0d6",
  deepWater: "#0c3b52",
  midWater: "#15607a",
  shallowWater: "#49bcae",
  foam: "#f3f9f7",
  sand: "#d8c59f",
  grass: "#5a7d5c",
  darkGrass: "#3f5e46",
  rock: "#7d8285",
  hullWhite: "#eef1ea",
  hullOrange: "#d4612f",
  tube: "#58646d",
  metal: "#a7afb3",
  wood: "#7a6243",
  glass: "#1c3b48",
} as const;

export const SUN_DIRECTION = new THREE.Vector3(-0.52, 0.56, -0.65).normalize();

export const FOG_DENSITY = 0.0017;

export const color = (hex: string) => new THREE.Color(hex).convertSRGBToLinear();

/**
 * Analytic sky used by both the sky dome and the ocean's reflection term, so
 * reflections always match the sky they come from.
 */
export function skyGLSL(): string {
  return `
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uHorizonLow;
uniform vec3 uSunTint;
uniform vec3 uSunDir;

vec3 owSky(vec3 dir) {
  float up = clamp(dir.y, -1.0, 1.0);
  vec3 col = mix(uHorizon, uZenith, pow(clamp(up, 0.0, 1.0), 0.6));
  col = mix(uHorizonLow, col, smoothstep(-0.12, 0.05, up));
  float sd = max(dot(normalize(dir), uSunDir), 0.0);
  col += uSunTint * pow(sd, 5.0) * 0.18;
  col += uSunTint * pow(sd, 220.0) * 1.1;
  return col;
}
`;
}

export function skyUniforms(): Record<string, THREE.IUniform> {
  return {
    uZenith: { value: color(PALETTE.zenith) },
    uHorizon: { value: color(PALETTE.horizon) },
    uHorizonLow: { value: color(PALETTE.horizonLow) },
    uSunTint: { value: color(PALETTE.sunTint) },
    uSunDir: { value: SUN_DIRECTION.clone() },
  };
}

/** Cheap value noise + fbm shared by the ocean detail and cloud layers. */
export const NOISE_GLSL = `
float owHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float owNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = owHash(i);
  float b = owHash(i + vec2(1.0, 0.0));
  float c = owHash(i + vec2(0.0, 1.0));
  float d = owHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float owFbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * owNoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}
`;

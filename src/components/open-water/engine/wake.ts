import * as THREE from "three";
import { PALETTE, color } from "./theme";
import { waterHeight, waveGLSL } from "./waves";

/** How far the boat travels between wake samples, in world units. */
const SAMPLE_STEP = 1.1;
const MAX_SAMPLES = 150;
const LIFETIME = 7.5;

const SPRAY_COUNT = 260;

interface Sample {
  x: number;
  z: number;
  rightX: number;
  rightZ: number;
  born: number;
  strength: number;
}

const trailVertex = /* glsl */ `
precision highp float;
attribute float aSide;
attribute float aAge;
attribute float aStrength;
uniform float uTime;
varying float vSide;
varying float vAge;
varying float vStrength;
varying vec2 vWorld;

${waveGLSL()}

void main() {
  vec3 p = position;
  vec3 n;
  float crest;
  vec3 disp = owWaveSurface(p.xz, uTime, 1.0, n, crest);
  p += disp;
  p.y += 0.07;
  vSide = aSide;
  vAge = aAge;
  vStrength = aStrength;
  vWorld = position.xz;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`;

const trailFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uFoam;
varying float vSide;
varying float vAge;
varying float vStrength;
varying vec2 vWorld;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  float s = abs(vSide);
  // Bright crests along the arms of the V, churn down the centre.
  float arms = smoothstep(0.52, 0.94, s) * (1.0 - smoothstep(0.94, 1.0, s));
  float churn = (1.0 - smoothstep(0.0, 0.6, s)) * 0.55;
  float mask = clamp(arms + churn, 0.0, 1.0);

  float grain = noise(vWorld * 1.9 + uTime * 0.6) * 0.6 + noise(vWorld * 5.5 - uTime * 1.1) * 0.4;
  mask *= 0.35 + 0.65 * grain;

  float fade = (1.0 - vAge) * (1.0 - vAge);
  float alpha = mask * fade * vStrength;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(uFoam, alpha * 0.55);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const sprayVertex = /* glsl */ `
precision highp float;
attribute float aLife;
attribute float aSize;
uniform float uPixelScale;
varying float vLife;
void main() {
  vLife = aLife;
  vec4 mv = viewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelScale / max(-mv.z, 1.0);
}
`;

const sprayFragment = /* glsl */ `
precision highp float;
uniform vec3 uFoam;
varying float vLife;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  float alpha = (1.0 - r * 4.0) * vLife;
  gl_FragColor = vec4(uFoam, alpha * 0.5);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export interface Wake {
  group: THREE.Group;
  update: (
    time: number,
    dt: number,
    x: number,
    z: number,
    heading: number,
    speed: number,
    bowX: number,
    bowZ: number,
  ) => void;
  setPixelScale: (scale: number) => void;
  reset: (x: number, z: number) => void;
  dispose: () => void;
}

export function createWake(): Wake {
  const group = new THREE.Group();
  group.frustumCulled = false;

  // --- Trail ribbon -------------------------------------------------------
  const positions = new Float32Array(MAX_SAMPLES * 2 * 3);
  const sides = new Float32Array(MAX_SAMPLES * 2);
  const ages = new Float32Array(MAX_SAMPLES * 2);
  const strengths = new Float32Array(MAX_SAMPLES * 2);
  const indices = new Uint16Array((MAX_SAMPLES - 1) * 6);
  for (let i = 0; i < MAX_SAMPLES - 1; i++) {
    const a = i * 2;
    indices.set([a, a + 1, a + 3, a, a + 3, a + 2], i * 6);
  }

  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  trailGeometry.setAttribute("aSide", new THREE.BufferAttribute(sides, 1));
  trailGeometry.setAttribute("aAge", new THREE.BufferAttribute(ages, 1));
  trailGeometry.setAttribute("aStrength", new THREE.BufferAttribute(strengths, 1));
  trailGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
  trailGeometry.setDrawRange(0, 0);

  const trailUniforms = {
    uTime: { value: 0 },
    uFoam: { value: color(PALETTE.foam) },
  };
  const trailMaterial = new THREE.ShaderMaterial({
    uniforms: trailUniforms,
    vertexShader: trailVertex,
    fragmentShader: trailFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const trail = new THREE.Mesh(trailGeometry, trailMaterial);
  trail.frustumCulled = false;
  trail.renderOrder = 2;
  group.add(trail);

  // --- Bow spray ----------------------------------------------------------
  const sprayPositions = new Float32Array(SPRAY_COUNT * 3);
  const sprayLife = new Float32Array(SPRAY_COUNT);
  const spraySize = new Float32Array(SPRAY_COUNT);
  const sprayVel = new Float32Array(SPRAY_COUNT * 3);

  const sprayGeometry = new THREE.BufferGeometry();
  sprayGeometry.setAttribute("position", new THREE.BufferAttribute(sprayPositions, 3));
  sprayGeometry.setAttribute("aLife", new THREE.BufferAttribute(sprayLife, 1));
  sprayGeometry.setAttribute("aSize", new THREE.BufferAttribute(spraySize, 1));

  const sprayUniforms = {
    uFoam: { value: color(PALETTE.foam) },
    uPixelScale: { value: 300 },
  };
  const sprayMaterial = new THREE.ShaderMaterial({
    uniforms: sprayUniforms,
    vertexShader: sprayVertex,
    fragmentShader: sprayFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const spray = new THREE.Points(sprayGeometry, sprayMaterial);
  spray.frustumCulled = false;
  spray.renderOrder = 3;
  group.add(spray);

  const samples: Sample[] = [];
  let lastX = 0;
  let lastZ = 0;
  let sprayCursor = 0;
  let sprayBudget = 0;

  const emitSpray = (x: number, y: number, z: number, speed: number, side: number) => {
    const i = sprayCursor;
    sprayCursor = (sprayCursor + 1) % SPRAY_COUNT;
    sprayPositions[i * 3] = x;
    sprayPositions[i * 3 + 1] = y;
    sprayPositions[i * 3 + 2] = z;
    sprayVel[i * 3] = side * (1.4 + Math.random() * 1.8);
    sprayVel[i * 3 + 1] = 2.4 + Math.random() * 3.4;
    sprayVel[i * 3 + 2] = (Math.random() - 0.5) * 2;
    sprayLife[i] = 1;
    // World-space radius; the vertex shader converts it to pixels.
    spraySize[i] = (0.12 + Math.random() * 0.3) * (0.6 + speed * 0.03);
  };

  return {
    group,

    update(time, dt, x, z, heading, speed, bowX, bowZ) {
      trailUniforms.uTime.value = time;

      const absSpeed = Math.abs(speed);
      const strength = Math.min(1, absSpeed / 16);

      if (Math.hypot(x - lastX, z - lastZ) > SAMPLE_STEP) {
        lastX = x;
        lastZ = z;
        // Right-hand vector for a boat whose bow points along +Z.
        samples.push({
          x,
          z,
          rightX: -Math.cos(heading),
          rightZ: Math.sin(heading),
          born: time,
          strength: Math.max(0.12, strength),
        });
        if (samples.length > MAX_SAMPLES) samples.shift();
      }

      while (samples.length && time - samples[0].born > LIFETIME) samples.shift();

      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const age = (time - s.born) / LIFETIME;
        const width = (0.75 + age * 4.6) * (0.4 + s.strength * 0.6);
        const left = i * 2;
        const right = left + 1;
        positions[left * 3] = s.x - s.rightX * width;
        positions[left * 3 + 1] = 0;
        positions[left * 3 + 2] = s.z - s.rightZ * width;
        positions[right * 3] = s.x + s.rightX * width;
        positions[right * 3 + 1] = 0;
        positions[right * 3 + 2] = s.z + s.rightZ * width;
        sides[left] = -1;
        sides[right] = 1;
        ages[left] = age;
        ages[right] = age;
        strengths[left] = s.strength;
        strengths[right] = s.strength;
      }

      trailGeometry.setDrawRange(0, Math.max(0, samples.length - 1) * 6);
      trailGeometry.attributes.position.needsUpdate = true;
      trailGeometry.attributes.aSide.needsUpdate = true;
      trailGeometry.attributes.aAge.needsUpdate = true;
      trailGeometry.attributes.aStrength.needsUpdate = true;

      // Spray from the bow once the hull is moving fast enough to throw water.
      if (absSpeed > 7) {
        sprayBudget += dt * (absSpeed - 6) * 7;
        const bowHeight = waterHeight(bowX, bowZ, time);
        while (sprayBudget >= 1) {
          sprayBudget -= 1;
          emitSpray(bowX, bowHeight + 0.2, bowZ, absSpeed, Math.random() < 0.5 ? -1 : 1);
        }
      } else {
        sprayBudget = 0;
      }

      for (let i = 0; i < SPRAY_COUNT; i++) {
        if (sprayLife[i] <= 0) continue;
        sprayLife[i] -= dt * 1.25;
        sprayVel[i * 3 + 1] -= 9.8 * dt;
        sprayPositions[i * 3] += sprayVel[i * 3] * dt;
        sprayPositions[i * 3 + 1] += sprayVel[i * 3 + 1] * dt;
        sprayPositions[i * 3 + 2] += sprayVel[i * 3 + 2] * dt;
        if (sprayLife[i] < 0) sprayLife[i] = 0;
      }
      sprayGeometry.attributes.position.needsUpdate = true;
      sprayGeometry.attributes.aLife.needsUpdate = true;
      sprayGeometry.attributes.aSize.needsUpdate = true;
    },

    setPixelScale(scale) {
      sprayUniforms.uPixelScale.value = scale;
    },

    reset(x, z) {
      samples.length = 0;
      lastX = x;
      lastZ = z;
      sprayLife.fill(0);
      trailGeometry.setDrawRange(0, 0);
    },

    dispose() {
      trailGeometry.dispose();
      trailMaterial.dispose();
      sprayGeometry.dispose();
      sprayMaterial.dispose();
    },
  };
}

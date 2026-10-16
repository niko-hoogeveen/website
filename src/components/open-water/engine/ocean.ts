import * as THREE from "three";
import { NOISE_GLSL, PALETTE, color, skyGLSL, skyUniforms, FOG_DENSITY } from "./theme";
import { waveGLSL } from "./waves";
import { DESTINATIONS } from "../destinations";

const SHORE_COUNT = DESTINATIONS.length;
/** Width of the shoaling band outside each island where water turns turquoise. */
const SHOAL_BAND = 34;

const vertexShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uShores[${SHORE_COUNT}];
uniform float uShoalBand;

varying vec3 vWorld;
varying vec3 vNormal;
varying float vCrest;
varying float vShore;

${waveGLSL()}

float shoreFactor(vec2 p) {
  float s = 0.0;
  for (int i = 0; i < ${SHORE_COUNT}; i++) {
    float d = length(p - uShores[i].xy);
    s = max(s, 1.0 - smoothstep(uShores[i].z, uShores[i].z + uShoalBand, d));
  }
  return s;
}

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vec2 p = world.xz;
  float shore = shoreFactor(p);
  float damp = mix(1.0, 0.22, shore);

  vec3 normal;
  float crest;
  vec3 disp = owWaveSurface(p, uTime, damp, normal, crest);

  world.xyz += disp;
  vWorld = world.xyz;
  vNormal = normal;
  vCrest = crest;
  vShore = shore;

  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uCameraPos;
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uShallow;
uniform vec3 uFoam;
uniform vec3 uSunColor;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uDetail;

varying vec3 vWorld;
varying vec3 vNormal;
varying float vCrest;
varying float vShore;

${skyGLSL()}
${NOISE_GLSL}

void main() {
  vec3 viewVec = uCameraPos - vWorld;
  float viewDist = length(viewVec);
  vec3 V = viewVec / max(viewDist, 0.0001);

  // High-frequency ripples, faded out with distance so they never alias.
  float detailFade = uDetail * (1.0 - smoothstep(60.0, 260.0, viewDist));
  vec2 q = vWorld.xz;
  float n1 = owNoise(q * 0.42 + vec2(uTime * 0.21, -uTime * 0.14));
  float n2 = owNoise(q * 0.93 - vec2(uTime * 0.34, uTime * 0.27));
  vec3 ripple = vec3(n1 - n2, 0.0, n2 - n1) * detailFade;
  vec3 N = normalize(vNormal + ripple);

  float fres = 0.02 + 0.98 * pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 5.0);

  vec3 reflected = reflect(-V, N);
  reflected.y = abs(reflected.y) * 0.85 + 0.03;
  vec3 skyCol = owSky(reflected);

  // Body colour: deep offshore, turquoise where it shoals.
  float depthMix = smoothstep(0.0, 0.75, vShore);
  vec3 body = mix(uDeep, uMid, smoothstep(-1.0, 1.0, vCrest) * 0.6);
  body = mix(body, uShallow, depthMix);

  // Ambient light from the sky above, which keeps the water from going black
  // in the shadowed troughs.
  vec3 ambient = owSky(vec3(0.0, 1.0, 0.0));
  body *= 0.72 + 0.55 * clamp(N.y, 0.0, 1.0);
  body += ambient * 0.12;

  // Sub-surface scatter: light bleeding through the back of a crest.
  float scatter = pow(clamp(vCrest, 0.0, 1.0), 2.0) * clamp(1.0 - dot(N, V), 0.0, 1.0);
  body += uShallow * scatter * 0.85;

  vec3 col = mix(body, skyCol, fres);

  // Sun glitter.
  vec3 H = normalize(uSunDir + V);
  float spec = pow(clamp(dot(N, H), 0.0, 1.0), 180.0);
  col += uSunColor * spec * 2.0;

  // Crest foam where the wave is sharpest.
  float crestFoam = smoothstep(0.76, 0.99, vCrest) * (0.45 + 0.55 * owFbm(q * 0.8 + uTime * 0.25));
  // Breaking band along every shoreline.
  float band = smoothstep(0.42, 0.95, vShore);
  float surf = band * (0.42 + 0.58 * sin(vShore * 26.0 - uTime * 1.9));
  surf *= 0.35 + 0.65 * owFbm(q * 1.1 - uTime * 0.4);
  float foam = clamp(crestFoam * 0.8 + surf, 0.0, 1.0);
  col = mix(col, uFoam, foam * 0.85);

  float fogAmount = 1.0 - exp(-pow(uFogDensity * viewDist, 2.0));
  col = mix(col, uFogColor, clamp(fogAmount, 0.0, 1.0));

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export interface Ocean {
  group: THREE.Group;
  material: THREE.ShaderMaterial;
  /** Keeps the detailed grid centred on the viewer without visible swimming. */
  update: (time: number, focusX: number, focusZ: number) => void;
  setDetail: (detail: number) => void;
  dispose: () => void;
}

export function createOcean(segments: number): Ocean {
  const group = new THREE.Group();

  const shores = DESTINATIONS.map(
    (d) => new THREE.Vector3(d.x, d.z, d.landRadius + 4),
  );

  const uniforms: Record<string, THREE.IUniform> = {
    ...skyUniforms(),
    uTime: { value: 0 },
    uCameraPos: { value: new THREE.Vector3() },
    uDeep: { value: color(PALETTE.deepWater) },
    uMid: { value: color(PALETTE.midWater) },
    uShallow: { value: color(PALETTE.shallowWater) },
    uFoam: { value: color(PALETTE.foam) },
    uSunColor: { value: color(PALETTE.sunLight) },
    uFogColor: { value: color(PALETTE.horizon) },
    uFogDensity: { value: FOG_DENSITY },
    uDetail: { value: 0.35 },
    uShores: { value: shores },
    uShoalBand: { value: SHOAL_BAND },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });

  const size = 1250;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const surface = new THREE.Mesh(geometry, material);
  surface.frustumCulled = false;
  surface.renderOrder = 0;
  group.add(surface);

  // Flat skirt that carries the ocean colour out to the fogged horizon.
  const skirtMaterial = new THREE.MeshBasicMaterial({
    color: color(PALETTE.horizon),
    fog: false,
    depthWrite: true,
  });
  const skirt = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), skirtMaterial);
  skirt.rotation.x = -Math.PI / 2;
  skirt.position.y = -1.2;
  skirt.renderOrder = -1;
  skirt.frustumCulled = false;
  group.add(skirt);

  const cell = size / segments;

  return {
    group,
    material,
    update(time, focusX, focusZ) {
      uniforms.uTime.value = time;
      // Snap to the grid so vertices stay at fixed world positions.
      surface.position.x = Math.round(focusX / cell) * cell;
      surface.position.z = Math.round(focusZ / cell) * cell;
      skirt.position.x = focusX;
      skirt.position.z = focusZ;
    },
    setDetail(detail) {
      uniforms.uDetail.value = detail;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      skirt.geometry.dispose();
      skirtMaterial.dispose();
    },
  };
}

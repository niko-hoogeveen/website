import * as THREE from "three";
import { NOISE_GLSL, PALETTE, color, skyGLSL, skyUniforms } from "./theme";

const vertexShader = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uCloud;
varying vec3 vDir;

${skyGLSL()}
${NOISE_GLSL}

void main() {
  vec3 dir = normalize(vDir);
  vec3 col = owSky(dir);

  // Flat cloud layer projected onto the dome; thickest near the horizon.
  float h = max(dir.y, 0.015);
  vec2 uv = dir.xz / h;
  float drift = uTime * 0.0045;
  float cloud = owFbm(uv * 0.055 + vec2(drift, drift * 0.4));
  cloud = smoothstep(0.46, 0.88, cloud);
  cloud *= smoothstep(0.0, 0.3, dir.y) * (1.0 - smoothstep(0.55, 1.0, dir.y) * 0.5);

  float lit = pow(max(dot(dir, uSunDir), 0.0), 3.0);
  vec3 cloudCol = mix(uCloud, uSunTint, lit * 0.7);
  col = mix(col, cloudCol, cloud * 0.72);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export interface Sky {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  update: (time: number) => void;
  dispose: () => void;
}

export function createSky(): Sky {
  const uniforms: Record<string, THREE.IUniform> = {
    ...skyUniforms(),
    uTime: { value: 0 },
    uCloud: { value: color("#f3ece2") },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const geometry = new THREE.SphereGeometry(4000, 48, 24);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -2;

  return {
    mesh,
    material,
    update(time) {
      uniforms.uTime.value = time;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

export const HORIZON_COLOR = color(PALETTE.horizon);

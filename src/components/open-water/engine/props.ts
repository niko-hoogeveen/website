import * as THREE from "three";
import { color } from "./theme";
import { sampleWater } from "./waves";
import { DESTINATIONS } from "../destinations";

/**
 * Floating channel markers and circling gulls. Both are driven from the same
 * analytic wave field as the ocean, so buoys sit convincingly in the swell.
 */

interface Buoy {
  x: number;
  z: number;
  kind: 0 | 1;
}

function layoutBuoys(): Buoy[] {
  const buoys: Buoy[] = [];
  // A pair of lateral markers on the approach to each destination, plus a few
  // mid-channel markers that hint at the routes between them.
  DESTINATIONS.forEach((d, i) => {
    const bearing = Math.atan2(-d.z, -d.x);
    for (const side of [-1, 1] as const) {
      const a = bearing + side * 0.3;
      const r = d.landRadius + 22;
      buoys.push({
        x: d.x + Math.cos(a) * r,
        z: d.z + Math.sin(a) * r,
        kind: side < 0 ? 0 : 1,
      });
    }
    const next = DESTINATIONS[(i + 1) % DESTINATIONS.length];
    buoys.push({
      x: (d.x + next.x) * 0.5,
      z: (d.z + next.z) * 0.5,
      kind: (i % 2) as 0 | 1,
    });
  });
  return buoys;
}

export interface Props {
  group: THREE.Group;
  update: (time: number) => void;
  dispose: () => void;
}

export function createProps(castShadows: boolean): Props {
  const group = new THREE.Group();
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  // --- buoys ---------------------------------------------------------------

  const buoys = layoutBuoys();

  const bodyGeometry = new THREE.CylinderGeometry(0.62, 0.78, 1.9, 10);
  const capGeometry = new THREE.ConeGeometry(0.46, 1.5, 8);
  capGeometry.translate(0, 1.6, 0);
  const lampGeometry = new THREE.SphereGeometry(0.22, 8, 6);
  lampGeometry.translate(0, 2.5, 0);
  disposables.push(bodyGeometry, capGeometry, lampGeometry);

  const buoyMaterials = [
    new THREE.MeshStandardMaterial({ color: color("#b8352a"), roughness: 0.65 }),
    new THREE.MeshStandardMaterial({ color: color("#1f6f4a"), roughness: 0.65 }),
  ];
  const lampMaterials = [
    new THREE.MeshStandardMaterial({
      color: color("#ff6a5a"),
      emissive: color("#ff3b2f"),
      emissiveIntensity: 1.2,
    }),
    new THREE.MeshStandardMaterial({
      color: color("#5ce0a0"),
      emissive: color("#1fd37a"),
      emissiveIntensity: 1.2,
    }),
  ];
  disposables.push(...buoyMaterials, ...lampMaterials);

  const buoyMeshes: THREE.InstancedMesh[] = [];
  const buoysByKind: Buoy[][] = [[], []];
  buoys.forEach((b) => buoysByKind[b.kind].push(b));

  for (const kind of [0, 1] as const) {
    const items = buoysByKind[kind];
    if (!items.length) continue;
    for (const [geometry, material] of [
      [bodyGeometry, buoyMaterials[kind]],
      [capGeometry, buoyMaterials[kind]],
      [lampGeometry, lampMaterials[kind]],
    ] as const) {
      const inst = new THREE.InstancedMesh(geometry, material, items.length);
      inst.castShadow = castShadows;
      inst.userData.items = items;
      buoyMeshes.push(inst);
      group.add(inst);
    }
  }

  // --- gulls ---------------------------------------------------------------

  const GULL_COUNT = 16;
  const wingShape = new THREE.BufferGeometry();
  // A single swept wing, hinged at the origin along +X.
  wingShape.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [0, 0, -0.35, 1.6, 0, 0.25, 0, 0, 0.45, 0, 0, -0.35, 0, 0, 0.45, 1.6, 0, 0.25],
      3,
    ),
  );
  wingShape.computeVertexNormals();
  disposables.push(wingShape);

  const gullMaterial = new THREE.MeshStandardMaterial({
    color: color("#f2f4f0"),
    roughness: 0.85,
    side: THREE.DoubleSide,
  });
  disposables.push(gullMaterial);

  const leftWing = new THREE.InstancedMesh(wingShape, gullMaterial, GULL_COUNT);
  const rightWing = new THREE.InstancedMesh(wingShape, gullMaterial, GULL_COUNT);
  leftWing.frustumCulled = false;
  rightWing.frustumCulled = false;
  group.add(leftWing, rightWing);

  const gulls = Array.from({ length: GULL_COUNT }, (_, i) => {
    const d = DESTINATIONS[i % DESTINATIONS.length];
    return {
      cx: d.x + (Math.random() - 0.5) * 60,
      cz: d.z + (Math.random() - 0.5) * 60,
      radius: 18 + Math.random() * 34,
      height: 16 + Math.random() * 26,
      speed: 0.14 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      flap: 4 + Math.random() * 3,
    };
  });

  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const pos = new THREE.Vector3();
  const scale = new THREE.Vector3(1, 1, 1);

  return {
    group,

    update(time) {
      for (const mesh of buoyMeshes) {
        const items = mesh.userData.items as Buoy[];
        for (let i = 0; i < items.length; i++) {
          const b = items[i];
          const w = sampleWater(b.x, b.z, time);
          pos.set(b.x, w.height - 0.35, b.z);
          euler.set(Math.asin(-w.normalZ) * 0.8, 0, Math.asin(w.normalX) * 0.8);
          quat.setFromEuler(euler);
          mesh.setMatrixAt(i, matrix.compose(pos, quat, scale));
        }
        mesh.instanceMatrix.needsUpdate = true;
      }

      for (let i = 0; i < gulls.length; i++) {
        const g = gulls[i];
        const a = g.phase + time * g.speed;
        const x = g.cx + Math.cos(a) * g.radius;
        const z = g.cz + Math.sin(a) * g.radius;
        const y = g.height + Math.sin(time * 0.6 + g.phase) * 2.2;
        const flap = Math.sin(time * g.flap + g.phase) * 0.85;
        const bank = -0.3;

        pos.set(x, y, z);
        euler.set(0, -a + Math.PI / 2, -(flap + bank), "YZX");
        quat.setFromEuler(euler);
        scale.set(-1, 1, 1);
        leftWing.setMatrixAt(i, matrix.compose(pos, quat, scale));

        euler.set(0, -a + Math.PI / 2, flap + bank, "YZX");
        quat.setFromEuler(euler);
        scale.set(1, 1, 1);
        rightWing.setMatrixAt(i, matrix.compose(pos, quat, scale));
      }
      leftWing.instanceMatrix.needsUpdate = true;
      rightWing.instanceMatrix.needsUpdate = true;
    },

    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}

import * as THREE from "three";

type AttributeName = "position" | "normal" | "color";

/**
 * Collects many small procedural parts into a handful of vertex-coloured
 * meshes. Islands are built from dozens of primitives, so batching them keeps
 * the whole world inside a small draw-call budget.
 */
export class GeometryBatch {
  private readonly buckets = new Map<
    string,
    { position: number[]; normal: number[]; color: number[] }
  >();

  private readonly normalMatrix = new THREE.Matrix3();
  private readonly tmpColor = new THREE.Color();

  add(
    geometry: THREE.BufferGeometry,
    matrix: THREE.Matrix4,
    colorHex: string | number,
    bucket = "matte",
  ): void {
    const src = geometry.index ? geometry.toNonIndexed() : geometry;
    const position = src.getAttribute("position");
    let normal = src.getAttribute("normal");
    if (!normal) {
      src.computeVertexNormals();
      normal = src.getAttribute("normal");
    }

    let target = this.buckets.get(bucket);
    if (!target) {
      target = { position: [], normal: [], color: [] };
      this.buckets.set(bucket, target);
    }

    this.normalMatrix.getNormalMatrix(matrix);
    this.tmpColor.set(colorHex as THREE.ColorRepresentation).convertSRGBToLinear();

    const v = new THREE.Vector3();
    for (let i = 0; i < position.count; i++) {
      v.fromBufferAttribute(position, i).applyMatrix4(matrix);
      target.position.push(v.x, v.y, v.z);
      v.fromBufferAttribute(normal, i).applyMatrix3(this.normalMatrix).normalize();
      target.normal.push(v.x, v.y, v.z);
      target.color.push(this.tmpColor.r, this.tmpColor.g, this.tmpColor.b);
    }

    if (src !== geometry) src.dispose();
  }

  /** Builds one geometry per bucket. Buckets with no parts are skipped. */
  build(): Map<string, THREE.BufferGeometry> {
    const out = new Map<string, THREE.BufferGeometry>();
    for (const [name, data] of this.buckets) {
      if (data.position.length === 0) continue;
      const geometry = new THREE.BufferGeometry();
      const set = (attr: AttributeName, values: number[]) =>
        geometry.setAttribute(
          attr,
          new THREE.BufferAttribute(new Float32Array(values), 3),
        );
      set("position", data.position);
      set("normal", data.normal);
      set("color", data.color);
      geometry.computeBoundingSphere();
      out.set(name, geometry);
    }
    this.buckets.clear();
    return out;
  }
}

const tmpMatrix = new THREE.Matrix4();
const tmpQuat = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();
const tmpPos = new THREE.Vector3();
const tmpScale = new THREE.Vector3();

/** Convenience TRS matrix builder that avoids per-call allocation. */
export function trs(
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0,
  sx = 1,
  sy = sx,
  sz = sx,
): THREE.Matrix4 {
  tmpPos.set(x, y, z);
  tmpEuler.set(rx, ry, rz);
  tmpQuat.setFromEuler(tmpEuler);
  tmpScale.set(sx, sy, sz);
  return tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
}

/**
 * Lofts a closed-ended surface through a list of cross sections. Each section
 * must contain the same number of points, given in the XY plane; `z` positions
 * the section along the length of the shape.
 */
export function loft(
  sections: { z: number; points: [number, number][] }[],
): THREE.BufferGeometry {
  const positions: number[] = [];
  const push = (s: { z: number; points: [number, number][] }, i: number) => {
    const p = s.points[i];
    positions.push(p[0], p[1], s.z);
  };

  for (let s = 0; s < sections.length - 1; s++) {
    const a = sections[s];
    const b = sections[s + 1];
    for (let i = 0; i < a.points.length - 1; i++) {
      push(b, i + 1);
      push(b, i);
      push(a, i);
      push(a, i + 1);
      push(b, i + 1);
      push(a, i);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Closes the end of a loft with a flat triangle fan. `flip` reverses the
 * winding so both ends of a shape can face outwards.
 */
export function cap(
  points: [number, number][],
  z: number,
  flip: boolean,
): THREE.BufferGeometry {
  let cx = 0;
  let cy = 0;
  for (const p of points) {
    cx += p[0];
    cy += p[1];
  }
  cx /= points.length;
  cy /= points.length;

  const positions: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (flip) positions.push(cx, cy, z, b[0], b[1], z, a[0], a[1], z);
    else positions.push(cx, cy, z, a[0], a[1], z, b[0], b[1], z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.computeVertexNormals();
  return geometry;
}

/** Disposes every geometry and material reachable from `root`. */
export function disposeObject(root: THREE.Object3D): void {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose();
  });
}

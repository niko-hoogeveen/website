import * as THREE from "three";
import { GeometryBatch, trs } from "./geometryUtils";
import { PALETTE, color, SUN_DIRECTION } from "./theme";
import { DESTINATIONS, Destination } from "../destinations";

// --- deterministic noise ---------------------------------------------------

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
}

function fbm(x: number, y: number): number {
  let v = 0;
  let a = 0.5;
  let fx = x;
  let fy = y;
  for (let i = 0; i < 3; i++) {
    v += a * valueNoise(fx, fy);
    fx *= 2.07;
    fy *= 2.03;
    a *= 0.5;
  }
  return v;
}

/** Small deterministic PRNG so the world is identical on every load. */
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// --- terrain ---------------------------------------------------------------

const RINGS = 26;
const SEGMENTS = 56;

interface Terrain {
  geometry: THREE.BufferGeometry;
  /** Surface height above sea level at a local offset from the island centre. */
  heightAt: (dx: number, dz: number) => number;
}

function createTerrain(d: Destination, peak: number, seed: number): Terrain {
  const R = d.landRadius;
  const rand = makeRandom(seed);
  const wobblePhase = rand() * Math.PI * 2;
  const noiseOffset = rand() * 120;

  const coastline = (angle: number) =>
    1 + 0.17 * Math.sin(angle * 3 + wobblePhase) + 0.09 * Math.sin(angle * 5 - wobblePhase * 2);

  const heightAt = (dx: number, dz: number) => {
    const r = Math.hypot(dx, dz);
    const angle = Math.atan2(dz, dx);
    const u = r / (R * coastline(angle));
    if (u >= 1) return -(u - 1) * 26;
    const dome = peak * (1 - u * u) ** 2;
    const ridge =
      (fbm((dx + noiseOffset) * 0.055, (dz + noiseOffset) * 0.055) - 0.5) *
      peak *
      0.8 *
      (1 - u * u);
    return dome + ridge;
  };

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const sand = new THREE.Color(PALETTE.sand);
  const grass = new THREE.Color(PALETTE.grass);
  const dark = new THREE.Color(PALETTE.darkGrass);
  const rock = new THREE.Color(PALETTE.rock);
  const tmp = new THREE.Color();

  for (let ring = 0; ring <= RINGS; ring++) {
    const rr = (ring / RINGS) ** 1.25 * R * 1.5;
    for (let seg = 0; seg <= SEGMENTS; seg++) {
      const angle = (seg / SEGMENTS) * Math.PI * 2;
      const dx = Math.cos(angle) * rr;
      const dz = Math.sin(angle) * rr;
      const y = heightAt(dx, dz);
      positions.push(dx, y, dz);

      // Slope from a small finite difference, used to expose rock on cliffs.
      const e = 1.2;
      const slope =
        Math.abs(heightAt(dx + e, dz) - y) / e + Math.abs(heightAt(dx, dz + e) - y) / e;

      const beach = 1 - THREE.MathUtils.smoothstep(y, 0.1, 2.2);
      const high = THREE.MathUtils.smoothstep(y, peak * 0.45, peak * 0.9);
      tmp.copy(grass).lerp(dark, high * 0.8);
      tmp.lerp(rock, THREE.MathUtils.clamp(slope * 0.55, 0, 0.85));
      tmp.lerp(sand, beach);
      // Fine colour variation without adding texture requests or draw calls.
      const mineralVariation = 0.92 + 0.12 * fbm(
        dx * 0.085 + seed * 1.31,
        dz * 0.085 - seed * 0.77,
      );
      tmp.multiplyScalar(mineralVariation);
      colors.push(tmp.r, tmp.g, tmp.b);
    }
  }

  const stride = SEGMENTS + 1;
  for (let ring = 0; ring < RINGS; ring++) {
    for (let seg = 0; seg < SEGMENTS; seg++) {
      const a = ring * stride + seg;
      const b = a + stride;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.translate(d.x, 0, d.z);

  return { geometry, heightAt };
}

// --- shared primitive geometries ------------------------------------------

const box = new THREE.BoxGeometry(1, 1, 1);
const cyl = new THREE.CylinderGeometry(1, 1, 1, 14);
const cylLow = new THREE.CylinderGeometry(1, 1, 1, 8);
const cone = new THREE.ConeGeometry(1, 1, 14);
const sphere = new THREE.SphereGeometry(1, 14, 10);
const taper = new THREE.CylinderGeometry(0.72, 1, 1, 18);

/** A simple gabled roof: a triangular prism one unit on each axis. */
const prism = (() => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, -0.5);
  shape.lineTo(0.5, -0.5);
  shape.lineTo(0, 0.5);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
})();

// Rings conform to the taper's silhouette rather than intersecting it as flat cylinders.
// Tower bounds relative to its terrain base: Y 1.5 .. 25.5; radius 3.3 -> 2.376.
const lighthouseStripeGeometry = [7, 16].map((centre) => {
  const height = 2.4;
  const radiusAt = (y: number) => 3.3 * (1 - 0.28 * (y - 1.5) / 24);
  return new THREE.CylinderGeometry(
    radiusAt(centre + height / 2) + 0.035,
    radiusAt(centre - height / 2) + 0.035,
    height,
    32,
  );
});

export const SHARED_PRIMITIVES = [
  box, cyl, cylLow, cone, sphere, taper, prism, ...lighthouseStripeGeometry,
];

// --- landmarks -------------------------------------------------------------

interface Ctx {
  batch: GeometryBatch;
  d: Destination;
  /** Local terrain height lookup, offset from the island centre. */
  h: (dx: number, dz: number) => number;
  rand: () => number;
  /** Positions where decorative vegetation may be placed. */
  trees: { x: number; z: number; y: number; scale: number }[];
  rocks: { x: number; z: number; y: number; scale: number; rot: number }[];
  /** World-space position of this island's navigation light. */
  beacon: THREE.Vector3;
}

const CONCRETE = "#b9b5aa";
const DARK_CONCRETE = "#78736b";
const WHITE = "#ecece5";
const RED = "#b23a2c";
const NAVY = "#24404f";
const STEEL = "#8e969b";

/** Glazing is a thin architectural facade, not a transparent cube over an entire building. */
function addGlazedFacade(
  batch: GeometryBatch,
  cx: number,
  cy: number,
  cz: number,
  width: number,
  height: number,
  front: number,
  angle: number,
  columns: number,
  rows = 1,
) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const originX = cx + sin * front;
  const originZ = cz + cos * front;
  batch.add(box, trs(originX, cy, originZ, 0, angle, 0, width, height, 0.14), "#44758a", "glass");

  // Extruded mullions and sill lines catch sunlight and cast real edge shadows.
  for (let i = 0; i <= columns; i++) {
    const lateral = (i / columns - 0.5) * width;
    batch.add(
      box,
      trs(originX + lateral * cos, cy, originZ - lateral * sin, 0, angle, 0, 0.13, height + 0.14, 0.21),
      "#354b54",
      "metal",
    );
  }
  for (let j = 0; j <= rows; j++) {
    const y = cy + (j / rows - 0.5) * height;
    batch.add(box, trs(originX, y, originZ, 0, angle, 0, width + 0.18, 0.13, 0.21), "#354b54", "metal");
  }
}

function addGlazingRing(
  batch: GeometryBatch,
  cx: number,
  cy: number,
  cz: number,
  width: number,
  depth: number,
  height: number,
  yaw: number,
  frontCols: number,
  sideCols: number,
) {
  const frontOffset = depth * 0.5 + 0.13;
  const sideOffset = width * 0.5 + 0.13;

  // Front / back
  addGlazedFacade(batch, cx, cy, cz, width - 0.5, height, frontOffset, yaw, frontCols);
  addGlazedFacade(batch, cx, cy, cz, width - 0.5, height, frontOffset, yaw + Math.PI, frontCols);

  // Left / right
  addGlazedFacade(
    batch,
    cx,
    cy,
    cz,
    depth - 0.5,
    height,
    sideOffset,
    yaw + Math.PI * 0.5,
    sideCols,
  );
  addGlazedFacade(
    batch,
    cx,
    cy,
    cz,
    depth - 0.5,
    height,
    sideOffset,
    yaw - Math.PI * 0.5,
    sideCols,
  );
}

function pilingsAndDeck(
  ctx: Ctx,
  x: number,
  z: number,
  width: number,
  length: number,
  angle: number,
) {
  const { batch, d } = ctx;
  batch.add(box, trs(d.x + x, 0.75, d.z + z, 0, angle, 0, width, 0.22, length), PALETTE.wood);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const steps = Math.max(2, Math.round(length / 4));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps - 0.5) * length;
    for (const side of [-1, 1]) {
      const ox = side * width * 0.42;
      const px = d.x + x + ox * cosA + t * sinA;
      const pz = d.z + z - ox * sinA + t * cosA;
      batch.add(cylLow, trs(px, -0.4, pz, 0, 0, 0, 0.22, 2.6, 0.22), "#4f4132");
    }
  }
}

function buildLighthouse(ctx: Ctx) {
  const { batch, d, h } = ctx;
  const baseY = h(0, 0);

  batch.add(cyl, trs(d.x, baseY + 1.2, d.z, 0, 0, 0, 6.4, 2.6, 6.4), DARK_CONCRETE, "concrete");
  batch.add(taper, trs(d.x, baseY + 13.5, d.z, 0, 0, 0, 3.3, 24, 3.3), WHITE, "painted");
  for (let i = 0; i < lighthouseStripeGeometry.length; i++) {
    const centre = 7 + i * 9;
    batch.add(
      lighthouseStripeGeometry[i],
      trs(d.x, baseY + centre, d.z),
      RED,
      "painted",
    );
  }
  batch.add(cyl, trs(d.x, baseY + 25.6, d.z, 0, 0, 0, 3.5, 0.5, 3.5), DARK_CONCRETE, "concrete");
  batch.add(
    new THREE.TorusGeometry(3.4, 0.09, 6, 22),
    trs(d.x, baseY + 26.5, d.z, Math.PI / 2),
    STEEL,
    "metal",
  );
  batch.add(cyl, trs(d.x, baseY + 27.8, d.z, 0, 0, 0, 2.1, 3.2, 2.1), "#a8d8dd", "glass");
  batch.add(cone, trs(d.x, baseY + 30.6, d.z, 0, 0, 0, 2.6, 2.6, 2.6), RED, "painted");
  batch.add(box, trs(d.x, baseY + 3.1, d.z + 3.25, 0, 0, 0, 1.45, 3.1, 0.13), NAVY, "painted");
  batch.add(sphere, trs(d.x + 0.45, baseY + 2.8, d.z + 3.38, 0, 0, 0, 0.095), STEEL, "metal");
  batch.add(sphere, trs(d.x, baseY + 32.1, d.z, 0, 0, 0, 0.34), STEEL, "metal");

  // Keeper's cottage, tucked downslope.
  const cx = -11;
  const cz = 8;
  const cy = h(cx, cz);
  batch.add(box, trs(d.x + cx, cy + 1.6, d.z + cz, 0, 0.4, 0, 8, 3.2, 5.6), WHITE, "painted");
  batch.add(prism, trs(d.x + cx, cy + 4.3, d.z + cz, 0, 0.4, 0, 8.6, 2.4, 6.2), RED, "painted");
  batch.add(box, trs(d.x + cx + 2.4, cy + 5.4, d.z + cz, 0, 0.4, 0, 0.8, 2.2, 0.8), DARK_CONCRETE);

  ctx.beacon.set(d.x, baseY + 27.8, d.z);

  const rand = ctx.rand;
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const r = 8 + rand() * (d.landRadius - 10);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = h(x, z);
    if (y < 0.6) continue;
    ctx.rocks.push({ x: d.x + x, z: d.z + z, y, scale: 0.7 + rand() * 1.8, rot: rand() * 6.28 });
  }
  for (let i = 0; i < 10; i++) {
    const a = rand() * Math.PI * 2;
    const r = 11 + rand() * (d.landRadius - 13);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = h(x, z);
    if (y < 1.4) continue;
    ctx.trees.push({ x: d.x + x, z: d.z + z, y, scale: 0.6 + rand() * 0.4 });
  }
}

function buildInnovation(ctx: Ctx) {
  const { batch, d, h, rand } = ctx;
  const baseY = h(0, 0);
  const pavilionYaw = 0.26;

  // Terraced plinth.
  for (let i = 0; i < 3; i++) {
    batch.add(
      cyl,
      trs(d.x, baseY - 1 + i * 1.1, d.z, 0, 0, 0, 17 - i * 3.4, 1.2, 17 - i * 3.4),
      i % 2 ? CONCRETE : DARK_CONCRETE,
      "concrete",
    );
  }

  // Cantilevered pavilion.
  const y = baseY + 2.2;

  // Lower volume
  batch.add(
    box,
    trs(d.x, y + 2.2, d.z, 0, pavilionYaw, 0, 20, 4.4, 12),
    WHITE,
    "painted",
  );
  addGlazingRing(batch, d.x, y + 2.4, d.z, 20, 12, 2.5, pavilionYaw, 7, 4);
  batch.add(
    box,
    trs(d.x, y + 4.8, d.z, 0, pavilionYaw, 0, 23.5, 0.7, 15),
    CONCRETE,
    "concrete",
  );

  // Upper volume
  batch.add(
    box,
    trs(d.x - 2, y + 8.2, d.z - 2, 0, pavilionYaw, 0, 11, 6, 8),
    WHITE,
    "painted",
  );
  addGlazingRing(batch, d.x - 2, y + 8.4, d.z - 2, 11, 8, 3.3, pavilionYaw, 4, 3);
  batch.add(
    box,
    trs(d.x - 2, y + 11.5, d.z - 2, 0, pavilionYaw, 0, 13, 0.6, 10),
    CONCRETE,
    "concrete",
  );

  // Solar array on the TOP roof, oriented toward the sun.
  const roofCenterX = d.x - 2;
  const roofCenterZ = d.z - 2;
  const roofY = y + 11.95;

  const solarYaw = Math.atan2(SUN_DIRECTION.x, SUN_DIRECTION.z) + Math.PI;
  const solarTilt = -0.58;

  const cosY = Math.cos(pavilionYaw);
  const sinY = Math.sin(pavilionYaw);

  const panelLayout: [number, number][] = [
    [-3.4, -1.8],
    [0.0, -1.8],
    [3.4, -1.8],
    [-3.4, 1.8],
    [0.0, 1.8],
    [3.4, 1.8],
  ];

  for (const [lx, lz] of panelLayout) {
    const px = roofCenterX + lx * cosY + lz * sinY;
    const pz = roofCenterZ - lx * sinY + lz * cosY;

    // Mount tray
    batch.add(
      box,
      trs(px, roofY - 0.16, pz, 0, solarYaw, 0, 3.0, 0.08, 3.6),
      "#7d8489",
      "metal",
    );

    // Panel
    batch.add(
      box,
      trs(px, roofY, pz, solarTilt, solarYaw, 0, 2.8, 0.14, 3.4),
      "#1d2d44",
      "painted",
    );
  }

  // Research mast.
  batch.add(
    cylLow,
    trs(d.x + 9, y + 11, d.z + 4, 0, 0, 0, 0.22, 16, 0.22),
    STEEL,
    "metal",
  );
  batch.add(
    sphere,
    trs(d.x + 9, y + 19.2, d.z + 4, 0, 0, 0, 0.5),
    "#7fd4c1",
    "emissive",
  );

  ctx.beacon.set(d.x + 9, y + 19.2, d.z + 4);

  pilingsAndDeck(ctx, 0, d.landRadius - 3, 5, 18, 0);

  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const r = 18 + rand() * (d.landRadius - 19);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const ty = h(x, z);
    if (ty < 1.2) continue;
    ctx.trees.push({
      x: d.x + x,
      z: d.z + z,
      y: ty,
      scale: 0.65 + rand() * 0.5,
    });
  }

  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2;
    const r = 16 + rand() * (d.landRadius - 16);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const ty = h(x, z);
    if (ty < 0.3) continue;
    ctx.rocks.push({
      x: d.x + x,
      z: d.z + z,
      y: ty,
      scale: 0.6 + rand() * 1.5,
      rot: rand() * 6.28,
    });
  }
}


function buildHarbour(ctx: Ctx) {
  const { batch, d, h, rand } = ctx;

  // Orient the harbour's local +Z axis toward the world centre.
  // This is the direction of the slipway, piers, and breakwater.
  const harbourYaw =
    Math.hypot(d.x, d.z) > 0.001
      ? Math.atan2(-d.x, -d.z)
      : 0;

  const cosY = Math.cos(harbourYaw);
  const sinY = Math.sin(harbourYaw);

  // Rotate a local harbour position around the island centre.
  const rotate = (x: number, z: number) => ({
    x: x * cosY + z * sinY,
    z: -x * sinY + z * cosY,
  });

  // Use the terrain height at the rotated position.
  const surface = (x: number, z: number) => {
    const p = rotate(x, z);
    return h(p.x, p.z);
  };

  // Convert local harbour geometry to its final world transform.
  const at = (
    x: number,
    y: number,
    z: number,
    rx: number,
    ry: number,
    rz: number,
    sx: number,
    sy = sx,
    sz = sx,
  ) => {
    const p = rotate(x, z);
    return trs(
      d.x + p.x,
      y,
      d.z + p.z,
      rx,
      ry + harbourYaw,
      rz,
      sx,
      sy,
      sz,
    );
  };

  // Retain the existing glazing implementation.
  const glazing = (
    x: number,
    y: number,
    z: number,
    width: number,
    depth: number,
    height: number,
    yaw: number,
    frontCols: number,
    sideCols: number,
  ) => {
    const p = rotate(x, z);
    addGlazingRing(
      batch,
      d.x + p.x,
      y,
      d.z + p.z,
      width,
      depth,
      height,
      yaw + harbourYaw,
      frontCols,
      sideCols,
    );
  };

  // Rotate docks around the island centre as well.
  const pier = (
    x: number,
    z: number,
    width: number,
    length: number,
    angle: number,
  ) => {
    const p = rotate(x, z);
    pilingsAndDeck(
      ctx,
      p.x,
      p.z,
      width,
      length,
      angle + harbourYaw,
    );
  };

  // -------------------------------------------------------
  // Breakwater: shelters the inward-facing harbour entrance
  // -------------------------------------------------------

  for (let i = 0; i < 22; i++) {
    const a = Math.PI * 0.08 + (i / 21) * Math.PI * 0.82;
    const r = d.landRadius + 5;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;

    batch.add(
      new THREE.DodecahedronGeometry(1, 0),
      at(
        x, 0.2 + rand() * 0.6, z,
        rand(), rand() * Math.PI * 2, rand(),
        2.2 + rand() * 1.4,
      ),
      PALETTE.rock,
    );
  }

  // -------------------------------------------------------
  // Rescue boathouse: hangar faces the world centre
  // -------------------------------------------------------

  const bx = 2;
  const bz = 13;
  const by = surface(bx, bz);
  const boathouseYaw = 0.1;

  batch.add(
    box,
    at(bx, by + 3.2, bz, 0, boathouseYaw, 0, 13, 6.4, 10),
    WHITE,
    "painted",
  );

  batch.add(
    prism,
    at(bx, by + 8.2, bz, 0, boathouseYaw, 0, 13.8, 3.6, 10.6),
    RED,
    "painted",
  );

  // Align the hangar door with the rotated front wall.
  const doorX = bx + Math.sin(boathouseYaw) * 5.1;
  const doorZ = bz + Math.cos(boathouseYaw) * 5.1;

  batch.add(
    box,
    at(doorX, by + 2.6, doorZ, 0, boathouseYaw, 0, 6.4, 5.2, 0.4),
    NAVY,
    "painted",
  );

  batch.add(
    box,
    at(
      bx + Math.sin(boathouseYaw) * 5.15,
      by + 6.6,
      bz + Math.cos(boathouseYaw) * 5.15,
      0, boathouseYaw, 0,
      9, 0.9, 0.3,
    ),
    RED,
    "painted",
  );

  batch.add(
    box,
    at(
      bx + Math.sin(boathouseYaw) * 5.35,
      by + 2.6,
      bz + Math.cos(boathouseYaw) * 5.35,
      0, boathouseYaw, 0,
      6.7, 0.1, 0.18,
    ),
    STEEL,
    "metal",
  );

  // -------------------------------------------------------
  // Operations building
  // -------------------------------------------------------

  const ox = -13;
  const oz = -2;
  const oy = surface(ox, oz);

  batch.add(
    box,
    at(ox, oy + 2.6, oz, 0, -0.5, 0, 10, 5.2, 7),
    WHITE,
    "painted",
  );

  glazing(
    ox, oy + 3.4, oz,
    10, 7, 1.65,
    -0.5, 5, 3,
  );

  batch.add(
    prism,
    at(ox, oy + 6.4, oz, 0, -0.5, 0, 10.6, 2.4, 7.6),
    NAVY,
    "painted",
  );

  // -------------------------------------------------------
  // Lookout tower
  // -------------------------------------------------------

  const towerX = ox - 5;
  const towerZ = oz - 3;

  batch.add(
    box,
    at(towerX, oy + 6, towerZ, 0, -0.5, 0, 4, 12, 4),
    WHITE,
    "painted",
  );

  batch.add(
    box,
    at(towerX, oy + 12.6, towerZ, 0, -0.5, 0, 5.4, 2.6, 5.4),
    NAVY,
    "painted",
  );

  glazing(
    towerX, oy + 12.6, towerZ,
    5.4, 5.4, 2,
    -0.5, 3, 3,
  );

  batch.add(
    box,
    at(towerX, oy + 14.2, towerZ, 0, -0.5, 0, 6, 0.5, 6),
    NAVY,
    "painted",
  );

  // -------------------------------------------------------
  // Flagpole
  // -------------------------------------------------------

  const fy = surface(-2, -10);

  batch.add(
    cylLow,
    at(-2, fy + 7, -10, 0, 0, 0, 0.16, 14, 0.16),
    WHITE,
  );

  batch.add(
    box,
    at(-0.6, fy + 13, -10, 0, 0, 0, 2.6, 1.6, 0.06),
    RED,
  );

  // -------------------------------------------------------
  // Harbour navigation light at the breakwater head
  // -------------------------------------------------------

  const lx = Math.cos(Math.PI * 0.08) * (d.landRadius + 5);
  const lz = Math.sin(Math.PI * 0.08) * (d.landRadius + 5);

  batch.add(
    cyl,
    at(lx, 2.4, lz, 0, 0, 0, 1.1, 5, 1.1),
    WHITE,
  );

  batch.add(
    cyl,
    at(lx, 5.4, lz, 0, 0, 0, 0.75, 1.4, 0.75),
    RED,
    "emissive",
  );

  const beaconPosition = rotate(lx, lz);
  ctx.beacon.set(
    d.x + beaconPosition.x,
    5.4,
    d.z + beaconPosition.z,
  );

  // -------------------------------------------------------
  // Piers: extend toward the world centre
  // -------------------------------------------------------

  pier(-6, d.landRadius + 2, 4.4, 24, 0.22);
  pier(8, d.landRadius + 10, 16, 4, 0.22);

  // -------------------------------------------------------
  // Natural vegetation
  // -------------------------------------------------------

  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const r = 14 + rand() * (d.landRadius - 15);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;

    const ty = h(x, z);
    if (ty < 1.5) continue;

    ctx.trees.push({
      x: d.x + x,
      z: d.z + z,
      y: ty,
      scale: 0.7 + rand() * 0.5,
    });
  }
}


function buildPort(ctx: Ctx) {
  const { batch, d, h, rand } = ctx;

  // Concrete quay around the seaward side.
  for (let i = 0; i < 16; i++) {
    const a = Math.PI * 1.15 + (i / 15) * Math.PI * 0.9;
    const r = d.landRadius - 1;
    batch.add(
      box,
      trs(d.x + Math.cos(a) * r, 0.9, d.z + Math.sin(a) * r, 0, -a, 0, 7, 3.4, 7),
      CONCRETE,
      "concrete",
    );
  }

  // Two gantry cranes.
  for (let c = 0; c < 2; c++) {
    const gx = -12 + c * 22;
    const gz = -d.landRadius + 9;
    const gy = Math.max(h(gx, gz), 2.2);

    for (const side of [-5.5, 5.5]) {
      batch.add(
        box,
        trs(d.x + gx + side, gy + 11, d.z + gz - 5, 0, 0, 0, 1, 22, 1),
        "#ca853a",
        "painted",
      );
      batch.add(
        box,
        trs(d.x + gx + side, gy + 11, d.z + gz + 5, 0, 0, 0, 1, 22, 1),
        "#ca853a",
        "painted",
      );
    }

    batch.add(
      box,
      trs(d.x + gx, gy + 22.4, d.z + gz - 3, 0, 0, 0, 13, 1.6, 2.2),
      "#ca853a",
      "painted",
    );
    batch.add(
      box,
      trs(d.x + gx, gy + 23.6, d.z + gz - 11, 0, 0, 0, 2.6, 1.4, 30),
      "#ca853a",
      "painted",
    );
    batch.add(
      box,
      trs(d.x + gx, gy + 20.4, d.z + gz - 20, 0, 0, 0, 2.4, 2.6, 2.4),
      NAVY,
      "painted",
    );
  }

  // Container stacks.
  const containerColors = ["#b2492f", "#2f6f8a", "#c7a23c", "#3f7a55", "#8a4f7d"];
  for (let i = 0; i < 24; i++) {
    const cx = -18 + (i % 6) * 7;
    const cz = 2 + Math.floor(i / 6) * 4.4;
    const levels = 1 + Math.floor(rand() * 3);
    const ty = Math.max(h(cx, cz), 2.2);

    for (let l = 0; l < levels; l++) {
      batch.add(
        box,
        trs(d.x + cx, ty + 1.3 + l * 2.6, d.z + cz, 0, rand() * 0.06, 0, 6.2, 2.5, 3.2),
        containerColors[(i + l) % containerColors.length],
        "painted",
      );
    }
  }

  // Exchange tower.
  const tx = 10;
  const tz = 16;
  const ty = Math.max(h(tx, tz), 2.4);
  batch.add(
    box,
    trs(d.x + tx, ty + 14, d.z + tz, 0, 0.3, 0, 11, 28, 11),
    "#38505f",
    "painted",
  );
  addGlazingRing(
    batch,
    d.x + tx,
    ty + 14,
    d.z + tz,
    11,
    11,
    25.5,
    0.3,
    5,
    5,
  );
  batch.add(
    box,
    trs(d.x + tx, ty + 28.6, d.z + tz, 0, 0.3, 0, 12.4, 1.2, 12.4),
    DARK_CONCRETE,
    "concrete",
  );
  batch.add(cylLow, trs(d.x + tx, ty + 33, d.z + tz, 0, 0, 0, 0.18, 8, 0.18), STEEL, "metal");
  batch.add(sphere, trs(d.x + tx, ty + 37.2, d.z + tz, 0, 0, 0, 0.42), "#ff5a4d", "emissive");
  ctx.beacon.set(d.x + tx, ty + 37.2, d.z + tz);

  // Warehouse.
  const wx = -16;
  const wz = 18;
  const wy = Math.max(h(wx, wz), 2.2);
  batch.add(
    box,
    trs(d.x + wx, wy + 3, d.z + wz, 0, -0.2, 0, 20, 6, 11),
    "#c9c4b7",
    "painted",
  );

  // Add a clerestory-style glazing ring near the top of the warehouse walls.
  addGlazingRing(
    batch,
    d.x + wx,
    wy + 4.1,
    d.z + wz,
    19.6,
    10.6,
    1.8,
    -0.2,
    8,
    4,
  );

  batch.add(
    prism,
    trs(d.x + wx, wy + 7.2, d.z + wz, 0, -0.2, 0, 20.6, 2.6, 11.4),
    STEEL,
    "painted",
  );

  pilingsAndDeck(ctx, -2, d.landRadius + 5, 30, 6, 0);

  for (let i = 0; i < 8; i++) {
    const a = rand() * Math.PI * 2;
    const r = 24 + rand() * (d.landRadius - 24);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const py = h(x, z);
    if (py < 1.6) continue;
    ctx.trees.push({ x: d.x + x, z: d.z + z, y: py, scale: 0.6 + rand() * 0.4 });
  }
}

function buildRadio(ctx: Ctx) {
  const { batch, d, h, rand } = ctx;
  const baseY = h(0, 0);

  // Lattice mast.
  const mastHeight = 46;
  const segments = 12;
  for (let i = 0; i < segments; i++) {
    const y0 = baseY + (i / segments) * mastHeight;
    const y1 = baseY + ((i + 1) / segments) * mastHeight;
    const w0 = 2.4 * (1 - i / segments) + 0.7;
    const w1 = 2.4 * (1 - (i + 1) / segments) + 0.7;
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
      const x0 = sx * w0 * 0.5;
      const z0 = sz * w0 * 0.5;
      const x1 = sx * w1 * 0.5;
      const z1 = sz * w1 * 0.5;
      const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
      batch.add(
        cylLow,
        trs(
          d.x + (x0 + x1) / 2,
          (y0 + y1) / 2,
          d.z + (z0 + z1) / 2,
          Math.atan2(z1 - z0, y1 - y0) * -1,
          0,
          Math.atan2(x1 - x0, y1 - y0),
          0.11,
          len,
          0.11,
        ),
        STEEL,
        "metal",
      );
    }
    batch.add(
      box,
      trs(d.x, y1, d.z, 0, 0, 0, w1 * 1.05, 0.11, 0.11),
      STEEL,
      "metal",
    );
    batch.add(
      box,
      trs(d.x, y1, d.z, 0, Math.PI / 2, 0, w1 * 1.05, 0.11, 0.11),
      STEEL,
      "metal",
    );
    if (i % 3 === 1) {
      batch.add(cyl, trs(d.x, y1, d.z, 0, 0, 0, w1 * 0.62, 0.5, w1 * 0.62), RED);
    }
  }
  batch.add(sphere, trs(d.x, baseY + mastHeight + 1, d.z, 0, 0, 0, 0.6), "#ff4a3d", "emissive");
  ctx.beacon.set(d.x, baseY + mastHeight + 1, d.z);

  // Guy wires.
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const ax = Math.cos(a) * 15;
    const az = Math.sin(a) * 15;
    const ay = h(ax, az);
    const top = baseY + mastHeight * 0.74;
    const len = Math.hypot(ax, top - ay, az);
    batch.add(
      cylLow,
      trs(
        d.x + ax / 2,
        (ay + top) / 2,
        d.z + az / 2,
        Math.atan2(az, top - ay) * -1,
        0,
        Math.atan2(ax, top - ay),
        0.055,
        len,
        0.055,
      ),
      "#5c6469",
      "metal",
    );
    batch.add(box, trs(d.x + ax, ay + 0.5, d.z + az, 0, a, 0, 1.4, 1, 1.4), DARK_CONCRETE);
  }

  // Satellite dish on a short pedestal.
  const dx = -9;
  const dz = 7;
  const dy = h(dx, dz);
  batch.add(cyl, trs(d.x + dx, dy + 1, d.z + dz, 0, 0, 0, 1.1, 2, 1.1), DARK_CONCRETE);
  batch.add(
    new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.42),
    trs(d.x + dx, dy + 2.6, d.z + dz, Math.PI * 0.72, 0, 0.4, 3.6, 2.2, 3.6),
    WHITE,
  );
  batch.add(cylLow, trs(d.x + dx + 1.2, dy + 3.6, d.z + dz - 1.6, 1.1, 0, 0.4, 0.1, 3, 0.1), STEEL, "metal");

  // Equipment hut.
  const ex = 8;
  const ez = -6;
  const ey = h(ex, ez);
  batch.add(box, trs(d.x + ex, ey + 1.5, d.z + ez, 0, 0.7, 0, 6.4, 3, 5), "#cfcabc", "painted");
  batch.add(box, trs(d.x + ex, ey + 3.2, d.z + ez, 0, 0.7, 0, 7, 0.4, 5.6), STEEL, "metal");

  for (let i = 0; i < 22; i++) {
    const a = rand() * Math.PI * 2;
    const r = 5 + rand() * (d.landRadius - 5);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = h(x, z);
    if (y < 0.3) continue;
    ctx.rocks.push({ x: d.x + x, z: d.z + z, y, scale: 0.6 + rand() * 2.1, rot: rand() * 6.28 });
  }
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    const r = 11 + rand() * (d.landRadius - 12);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = h(x, z);
    if (y < 1.5) continue;
    ctx.trees.push({ x: d.x + x, z: d.z + z, y, scale: 0.5 + rand() * 0.3 });
  }
}

const BUILDERS: Record<string, { build: (ctx: Ctx) => void; peak: number; seed: number }> = {
  lighthouse: { build: buildLighthouse, peak: 13, seed: 11 },
  innovation: { build: buildInnovation, peak: 9, seed: 27 },
  harbour: { build: buildHarbour, peak: 11, seed: 43 },
  port: { build: buildPort, peak: 7, seed: 61 },
  radio: { build: buildRadio, peak: 16, seed: 83 },
};

// --- assembly --------------------------------------------------------------

export interface World {
  group: THREE.Group;
  /** Navigation light positions, keyed by destination id. */
  beacons: Map<string, THREE.Vector3>;
  dispose: () => void;
}

export function createIslands(castShadows: boolean): World {
  const group = new THREE.Group();
  const beacons = new Map<string, THREE.Vector3>();
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.94,
    metalness: 0,
  });
  const matteMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0,
  });
  const paintedMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.54,
    metalness: 0.04,
    clearcoat: 0.24,
    clearcoatRoughness: 0.36,
  });
  const concreteMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.96,
    metalness: 0,
  });
  const metalMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.32,
    metalness: 0.66,
  });
  // Tinted architectural glazing. No per-frame transmission pass (important
  // for performance, and more predictable on these merged geometry batches).
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.18,
    metalness: 0.12,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
    clearcoat: 0.9,
    clearcoatRoughness: 0.11,
    side: THREE.FrontSide,
  });
  const emissiveMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    emissive: new THREE.Color("#ffffff"),
    emissiveIntensity: 1.35,
    roughness: 0.4,
    toneMapped: false,
  });
  const bucketMaterials: Record<string, THREE.Material> = {
    matte: matteMaterial,
    painted: paintedMaterial,
    concrete: concreteMaterial,
    metal: metalMaterial,
    glass: glassMaterial,
    emissive: emissiveMaterial,
  };
  disposables.push(
    terrainMaterial,
    matteMaterial,
    paintedMaterial,
    concreteMaterial,
    metalMaterial,
    glassMaterial,
    emissiveMaterial,
  );

  const allTrees: Ctx["trees"] = [];
  const allRocks: Ctx["rocks"] = [];

  for (const d of DESTINATIONS) {
    const spec = BUILDERS[d.id];
    const terrain = createTerrain(d, spec.peak, spec.seed);
    const land = new THREE.Mesh(terrain.geometry, terrainMaterial);
    land.receiveShadow = castShadows;
    land.castShadow = false;
    group.add(land);
    disposables.push(terrain.geometry);

    const batch = new GeometryBatch();
    const ctx: Ctx = {
      batch,
      d,
      h: terrain.heightAt,
      rand: makeRandom(spec.seed * 7 + 5),
      trees: allTrees,
      rocks: allRocks,
      beacon: new THREE.Vector3(),
    };
    spec.build(ctx);
    beacons.set(d.id, ctx.beacon.clone());

    for (const [bucket, geometry] of batch.build()) {
      const mesh = new THREE.Mesh(geometry, bucketMaterials[bucket] ?? matteMaterial);
      mesh.castShadow = castShadows && bucket !== "glass";
      mesh.receiveShadow = castShadows;
      group.add(mesh);
      disposables.push(geometry);
    }
  }

  // --- instanced vegetation and rocks --------------------------------------

  const trunkGeometry = new THREE.CylinderGeometry(0.28, 0.46, 3.4, 6);
  trunkGeometry.translate(0, 1.7, 0);
  const canopyGeometry = new THREE.ConeGeometry(2.1, 7.4, 8);
  canopyGeometry.translate(0, 6.2, 0);
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  disposables.push(trunkGeometry, canopyGeometry, rockGeometry);

  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: color("#4a3a2a"),
    roughness: 0.9,
  });
  const canopyMaterial = new THREE.MeshStandardMaterial({
    color: color(PALETTE.grass).lerp(color(PALETTE.darkGrass), 0.42),
    roughness: 0.92,
  });
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: color(PALETTE.rock),
    roughness: 0.95,
    flatShading: true,
  });
  disposables.push(trunkMaterial, canopyMaterial, rockMaterial);

  const matrix = new THREE.Matrix4();
  const euler = new THREE.Euler();
  const quat = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scale = new THREE.Vector3();

  const makeInstances = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    items: { x: number; y: number; z: number; scale: number; rot?: number }[],
    yOffset: number,
  ) => {
    const inst = new THREE.InstancedMesh(geometry, material, items.length);
    inst.castShadow = castShadows;
    inst.receiveShadow = castShadows;
    items.forEach((item, i) => {
      pos.set(item.x, item.y + yOffset, item.z);
      euler.set(0, item.rot ?? 0, 0);
      quat.setFromEuler(euler);
      scale.setScalar(item.scale);
      inst.setMatrixAt(i, matrix.compose(pos, quat, scale));
    });
    inst.instanceMatrix.needsUpdate = true;
    group.add(inst);
    return inst;
  };

  if (allTrees.length) {
    makeInstances(trunkGeometry, trunkMaterial, allTrees, -0.3);
    makeInstances(canopyGeometry, canopyMaterial, allTrees, -0.3);
  }
  if (allRocks.length) makeInstances(rockGeometry, rockMaterial, allRocks, -0.3);

  return {
    group,
    beacons,
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}
import * as THREE from "three";
import { PALETTE, color } from "./theme";
import { loft, cap } from "./geometryUtils";

/**
 * A procedurally lofted rigid-hull inflatable: the kind of boat used by
 * inshore search-and-rescue crews. Bow points along +Z.
 */

const STATIONS = 26;
const STERN_Z = -3.5;
const BOW_Z = 4.4;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function halfBeam(t: number): number {
  return 1.46 * (1 - smoothstep(0.5, 1.0, t) ** 1.25 * 0.93);
}

function keelY(t: number): number {
  return -0.74 + 0.95 * smoothstep(0.42, 1.0, t) ** 1.5;
}

function chineY(t: number): number {
  return -0.2 + 0.52 * smoothstep(0.55, 1.0, t) ** 1.4;
}

function sheerY(t: number): number {
  return 0.52 + 0.46 * t ** 2.3;
}

function buildHull(): {
  topsides: THREE.BufferGeometry[];
  bottom: THREE.BufferGeometry[];
  deck: THREE.BufferGeometry;
  transom: THREE.BufferGeometry;
} {
  const bands: { z: number; points: [number, number][] }[][] = [[], [], [], []];

  for (let i = 0; i < STATIONS; i++) {
    const t = i / (STATIONS - 1);
    const z = STERN_Z + (BOW_Z - STERN_Z) * t;
    const b = halfBeam(t);
    const k = keelY(t);
    const c = chineY(t);
    const s = sheerY(t);

    bands[0].push({ z, points: [[-b, s], [-b * 0.99, c]] });
    bands[1].push({ z, points: [[-b * 0.99, c], [0, k]] });
    bands[2].push({ z, points: [[0, k], [b * 0.99, c]] });
    bands[3].push({ z, points: [[b * 0.99, c], [b, s]] });
  }

  // Deck: a flat sole between the chines.
  const deck: { z: number; points: [number, number][] }[] = [];
  for (let i = 0; i < STATIONS; i++) {
    const t = i / (STATIONS - 1);
    const z = STERN_Z + (BOW_Z - STERN_Z) * t;
    const b = halfBeam(t) * 0.97;
    const y = chineY(t) + 0.55 + 0.18 * t;
    deck.push({ z, points: [[b, y], [-b, y]] });
  }

  const sternSection: [number, number][] = [
    [-halfBeam(0), sheerY(0)],
    [-halfBeam(0) * 0.99, chineY(0)],
    [0, keelY(0)],
    [halfBeam(0) * 0.99, chineY(0)],
    [halfBeam(0), sheerY(0)],
    [-halfBeam(0), sheerY(0)],
  ];

  return {
    topsides: [loft(bands[0]), loft(bands[3])],
    bottom: [loft(bands[1]), loft(bands[2])],
    deck: loft(deck),
    transom: cap(sternSection, STERN_Z, true),
  };
}

/** The inflatable collar: a tube swept from the transom, round the bow, back. */
function buildCollar(): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  const add = (t: number, side: number) => {
    const b = halfBeam(t) + 0.1;
    points.push(new THREE.Vector3(side * b, sheerY(t) + 0.08, STERN_Z + (BOW_Z - STERN_Z) * t));
  };
  for (let i = 0; i <= 20; i++) add(0.02 + (i / 20) * 0.98, -1);
  points.push(new THREE.Vector3(0, sheerY(1) + 0.08, BOW_Z + 0.18));
  for (let i = 20; i >= 0; i--) add(0.02 + (i / 20) * 0.98, 1);

  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal", 0);
  return new THREE.TubeGeometry(curve, 110, 0.27, 10, true);
}

export interface BoatModel {
  group: THREE.Group;
  /** Local-space bow position, used to spawn spray. */
  bow: THREE.Vector3;
  /** Navigation lights, dimmed during the day and lit at the stern. */
  setLightIntensity: (value: number) => void;
  dispose: () => void;
}

export function createBoat(): BoatModel {
  const group = new THREE.Group();
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  const track = <T extends THREE.BufferGeometry | THREE.Material>(x: T): T => {
    disposables.push(x);
    return x;
  };

  const matte = (hex: string, roughness = 0.62, metalness = 0.05) =>
    track(
      new THREE.MeshStandardMaterial({
        color: color(hex),
        roughness,
        metalness,
      }),
    );

  const hullMat = matte(PALETTE.hullWhite, 0.42, 0.04);
  const collarMat = matte(PALETTE.tube, 0.82, 0.0);
  const accentMat = matte(PALETTE.hullOrange, 0.5, 0.05);
  const deckMat = matte("#b9beb8", 0.88, 0.02);
  const metalMat = matte(PALETTE.metal, 0.3, 0.85);
  const darkMat = matte("#2a3138", 0.7, 0.2);
  const glassMat = track(
    new THREE.MeshStandardMaterial({
      color: color("#bfe0e6"),
      roughness: 0.06,
      metalness: 0.1,
      transparent: true,
      opacity: 0.38,
    }),
  );

  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
    const m = new THREE.Mesh(track(geometry), material);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };

  const hull = buildHull();
  for (const g of hull.topsides) mesh(g, accentMat);
  for (const g of hull.bottom) mesh(g, hullMat);
  mesh(hull.deck, deckMat);
  mesh(hull.transom, accentMat);

  mesh(buildCollar(), collarMat);

  // Helm console and windscreen.
  const helm = mesh(new THREE.BoxGeometry(1.16, 0.65, 0.82), hullMat);
  helm.position.set(0, 0.72, 0.2);
  const helmFace = mesh(new THREE.BoxGeometry(0.86, 0.34, 0.08), darkMat);
  helmFace.position.set(0, 1.0, 0.63);
  helmFace.rotation.x = -0.38;
  const screen = mesh(new THREE.PlaneGeometry(0.66, 0.24), track(
    new THREE.MeshStandardMaterial({
      color: color("#0d2f3a"),
      emissive: color("#2ea7b5"),
      emissiveIntensity: 0.9,
      roughness: 0.3,
    }),
  ));
  screen.position.set(0, 1.0, 0.68);
  screen.rotation.x = -0.38;

  const windscreen = mesh(new THREE.BoxGeometry(1.1, 0.5, 0.05), glassMat);
  windscreen.position.set(0, 1.45, 0.34);
  windscreen.rotation.x = -0.22;
  windscreen.castShadow = false;

  const wheel = mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 20), darkMat);
  wheel.position.set(0, 1.12, 0.1);
  wheel.rotation.x = 1.05;

  // Grab frame over the console.
  for (const side of [-1, 1]) {
    const leg = mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 8), metalMat);
    leg.position.set(side * 0.58, 1.5, 0.0);
    leg.rotation.z = side * 0.08;
  }
  const bar = mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.28, 8), metalMat);
  bar.position.set(0, 2.22, 0.0);
  bar.rotation.z = Math.PI / 2;

  // Bench seat and bow locker.
  const seat = mesh(new THREE.BoxGeometry(1.0, 0.44, 0.7), darkMat);
  seat.position.set(0, 0.52, -0.82);
  const locker = mesh(new THREE.BoxGeometry(1.5, 0.34, 1.5), hullMat);
  locker.position.set(0, 0.72, 2.5);

  // Outboard engine.
  const cowling = mesh(new THREE.BoxGeometry(0.72, 0.78, 0.66), darkMat);
  cowling.position.set(0, 0.5, -3.7);
  const shaft = mesh(new THREE.BoxGeometry(0.3, 1.2, 0.34), darkMat);
  shaft.position.set(0, -0.2, -3.78);
  const gearcase = mesh(new THREE.CapsuleGeometry(0.17, 0.5, 4, 8), darkMat);
  gearcase.position.set(0, -0.88, -3.86);
  gearcase.rotation.x = Math.PI / 2;
  const skeg = mesh(new THREE.BoxGeometry(0.07, 0.42, 0.5), darkMat);
  skeg.position.set(0, -1.05, -3.86);

  // Antenna and masthead light.
  const antenna = mesh(new THREE.CylinderGeometry(0.018, 0.028, 1.9, 6), metalMat);
  antenna.position.set(0.45, 3.0, -0.05);

  const lightMaterials: THREE.MeshStandardMaterial[] = [];
  const navLight = (x: number, y: number, z: number, hex: string, size = 0.085) => {
    const material = track(
      new THREE.MeshStandardMaterial({
        color: color(hex),
        emissive: color(hex),
        emissiveIntensity: 1.4,
        roughness: 0.4,
      }),
    );
    lightMaterials.push(material);
    const m = mesh(new THREE.SphereGeometry(size, 8, 6), material);
    m.position.set(x, y, z);
    m.castShadow = false;
    return m;
  };
  navLight(-0.95, 1.1, 2.2, "#34c759");
  navLight(0.95, 1.1, 2.2, "#ff3b30");
  navLight(0, 2.4, -0.02, "#fff6e0", 0.07);
  navLight(0.45, 3.98, -0.05, "#ffb648", 0.055);

  const bow = new THREE.Vector3(0, 0.1, BOW_Z);

  return {
    group,
    bow,
    setLightIntensity(value) {
      for (const m of lightMaterials) m.emissiveIntensity = value;
    },
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}

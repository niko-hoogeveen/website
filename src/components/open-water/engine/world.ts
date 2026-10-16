import * as THREE from "three";
import { createOcean } from "./ocean";
import { createSky } from "./sky";
import { createBoat } from "./boat";
import { createWake } from "./wake";
import { createIslands } from "./islands";
import { createProps } from "./props";
import { createInput } from "./input";
import { PALETTE, SUN_DIRECTION, FOG_DENSITY, color } from "./theme";
import { sampleWater, waterHeight } from "./waves";
import { DESTINATIONS, Destination, DestinationId, START, WORLD_RADIUS } from "../destinations";

export interface Telemetry {
  /** Compass heading in degrees, 0 = north. */
  heading: number;
  /** Speed over ground in knots. */
  knots: number;
  /** 0-1 throttle demand, for the HUD gauge. */
  power: number;
  /** Distance in metres to the nearest destination. */
  range: number;
  /** Boat position on the XZ plane, for the chart. */
  x: number;
  z: number;
  /** Frames per second, rolling average. */
  fps: number;
  /** True while the boat is being nudged back inside the charted area. */
  offChart: boolean;
}

export type Phase = "intro" | "sailing" | "docked";

export interface WorldCallbacks {
  onTelemetry: (telemetry: Telemetry) => void;
  onNearChange: (id: DestinationId | null) => void;
  onPhaseChange: (phase: Phase, dockedId: DestinationId | null) => void;
  onEngage: () => void;
  /** Supplies the DOM node used for a destination's floating world label. */
  getLabel: (id: DestinationId) => HTMLElement | null;
}

export interface WorldHandle {
  setTouch: (throttle: number, steer: number) => void;
  dock: () => void;
  undock: () => void;
  reset: () => void;
  setPaused: (paused: boolean) => void;
  /** Normalised engine load, for the ambient audio mix. */
  getEnginePower: () => number;
  dispose: () => void;
}

interface Quality {
  pixelRatio: number;
  shadows: boolean;
  oceanSegments: number;
  detail: number;
}

function detectQuality(): Quality {
  const coarse =
    typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const lean = coarse || cores <= 4;
  return {
    pixelRatio: lean ? 1.25 : 1.75,
    shadows: !lean,
    oceanSegments: lean ? 140 : 232,
    detail: lean ? 0.22 : 0.4,
  };
}

const KNOTS_PER_UNIT = 1.94;
const MAX_SPEED = 40;

export function createWorld(
  canvas: HTMLCanvasElement,
  callbacks: WorldCallbacks,
  reducedMotion: boolean,
): WorldHandle {
  const quality = detectQuality();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.pixelRatio < 1.5,
    powerPreference: "high-performance",
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.5, 6000);
  camera.position.set(0, 24, 120);

  // --- lighting ------------------------------------------------------------

  // A single warm key light creates readable architectural form. Keep the
  // hemisphere light subdued so walls, foliage and docks have real contrast.
  const sun = new THREE.DirectionalLight(color(PALETTE.sunLight), 2.35);
  sun.position.copy(SUN_DIRECTION).multiplyScalar(240);
  sun.castShadow = quality.shadows;
  if (quality.shadows) {
    sun.shadow.mapSize.set(2048, 2048);
    const cam = sun.shadow.camera;
    cam.near = 1;
    cam.far = 560;
    cam.left = -105;
    cam.right = 105;
    cam.top = 105;
    cam.bottom = -105;
    // The previous 0.5 normalBias displaced shadows from small geometry.
    sun.shadow.bias = -0.00022;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 2;
  }
  scene.add(sun, sun.target);

  const hemi = new THREE.HemisphereLight("#d9edf5", "#355462", 0.76);
  const skyFill = new THREE.DirectionalLight("#b2dce8", 0.34);
  skyFill.position.set(-120, 70, -100);
  const coastalRim = new THREE.DirectionalLight("#f7dfbd", 0.22);
  coastalRim.position.set(35, 35, 100);
  scene.add(hemi, skyFill, coastalRim);

  // --- world ---------------------------------------------------------------

  const sky = createSky();
  scene.add(sky.mesh);

  const ocean = createOcean(quality.oceanSegments);
  scene.add(ocean.group);

  const islands = createIslands(quality.shadows);
  scene.add(islands.group);

  // Accents are deliberately local: distant islands do not keep five extra
  // point lights at full power throughout the entire map.
  // One moving accent lamp gives the closest beacon a local pool of light
  // without adding five point-light calculations to every surface shader.
  const beaconAccent = new THREE.PointLight("#9fe5de", 0, 56, 2);
  beaconAccent.castShadow = false;
  scene.add(beaconAccent);
  const beaconAnchors = DESTINATIONS.map((destination) => ({
    destination,
    position: islands.beacons.get(destination.id) ?? new THREE.Vector3(destination.x, 16, destination.z),
  }));

  const props = createProps(quality.shadows);
  scene.add(props.group);

  const wake = createWake();
  scene.add(wake.group);

  const boat = createBoat();
  scene.add(boat.group);

  // Pulsing navigation light at the top of each landmark.
  const glowTexture = createGlowTexture();
  const glowSprites = DESTINATIONS.map((d) => {
    const material = new THREE.SpriteMaterial({
      map: glowTexture,
      color: new THREE.Color(d.accent),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
      fog: false,
    });
    const sprite = new THREE.Sprite(material);
    const pos = islands.beacons.get(d.id);
    if (pos) sprite.position.copy(pos);
    sprite.scale.setScalar(9);
    scene.add(sprite);
    return { sprite, material, phase: Math.random() * Math.PI * 2 };
  });

  // Environment reflections, baked once from the sky dome.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const cubeTarget = new THREE.WebGLCubeRenderTarget(128);
  const cubeCamera = new THREE.CubeCamera(1, 6000, cubeTarget);
  cubeCamera.position.set(0, 30, 0);
  sky.update(0);
  const previousVisibility = new Map<THREE.Object3D, boolean>();
  scene.traverse((o) => {
    if (o !== sky.mesh && o !== scene) {
      previousVisibility.set(o, o.visible);
      o.visible = false;
    }
  });
  sky.mesh.visible = true;
  cubeCamera.update(renderer, scene);
  for (const [o, v] of previousVisibility) o.visible = v;
  previousVisibility.clear();
  const envTarget = pmrem.fromCubemap(cubeTarget.texture);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.85;
  cubeTarget.dispose();
  pmrem.dispose();

  // --- simulation state ----------------------------------------------------

  const boatState = {
    x: START.x,
    z: START.z,
    heading: START.heading,
    surge: 0,
    sway: 0,
    yawRate: 0,
    visualRoll: 0,
    visualPitch: 0,
  };

  let phase: Phase = reducedMotion ? "sailing" : "intro";
  let introTime = 0;
  let near: Destination | null = null;
  let docked: Destination | null = null;
  let offChart = false;
  let paused = false;
  let elapsed = 0;

  const camPos = new THREE.Vector3(START.x, 40, START.z + 90);
  const camLook = new THREE.Vector3(START.x, 2, START.z);
  const desiredPos = new THREE.Vector3();
  const desiredLook = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const projected = new THREE.Vector3();

  const telemetry: Telemetry = {
    heading: 0,
    knots: 0,
    power: 0,
    range: 0,
    x: START.x,
    z: START.z,
    fps: 60,
    offChart: false,
  };

  const setPhase = (next: Phase) => {
    if (phase === next) return;
    phase = next;
    callbacks.onPhaseChange(next, docked ? docked.id : null);
  };

  const input = createInput({
    onDock: () => {
        if (phase === "sailing") 
            handle.dock();
        else 
            handle.undock();
        },
    onReset: () => handle.reset(),
    onCancel: () => handle.undock(),
    onEngage: () => {
      if (phase === "intro") setPhase("sailing");
      callbacks.onEngage();
    },
  });

  // --- frame loop ----------------------------------------------------------

  let frameId = 0;
  let lastTime = performance.now();
  let frameAccumulator = 0;
  let frameCount = 0;
  let telemetryCountdown = 0;
  let smoothedFps = 60;
  let slowTicks = 0;
  let degradeStep = 0;
  const viewportSize = new THREE.Vector2();

  function resize(): boolean {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return false;
    renderer.getSize(viewportSize);
    if (viewportSize.x !== width || viewportSize.y !== height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      // Converts a world-space radius into pixels at one unit of depth.
      wake.setPixelScale(height / (2 * Math.tan((camera.fov * Math.PI) / 360)));
    }
    return true;
  }

  function stepPhysics(dt: number) {
    const s = boatState;
    const controllable = phase !== "docked";
    const throttle = controllable ? input.state.throttle : 0;
    const steer = controllable ? input.state.steer : 0;

    // Surge: thrust against quadratic and linear drag.
    const thrust = throttle * (throttle >= 0 ? 45 : 14);
    const drag = -s.surge * Math.abs(s.surge) * 0.028 - s.surge * 0.72;
    s.surge += (thrust + drag) * dt;
    s.surge = THREE.MathUtils.clamp(s.surge, -7, MAX_SPEED);
    if (!controllable) s.surge *= Math.exp(-1.6 * dt);

    // Steering authority builds with speed, then eases off once planing so the
    // boat tracks straight at full throttle. Port (negative steer) swings the
    // bow to port, which lowers the compass heading.
    const speed = Math.abs(s.surge);
    const authority =
      THREE.MathUtils.clamp(speed / 6, 0, 1) * (1 - THREE.MathUtils.clamp(speed / MAX_SPEED, 0, 1) * 0.3);
    const targetYaw = -steer * 0.95 * authority * Math.sign(s.surge || 1);
    s.yawRate += (targetYaw - s.yawRate) * (1 - Math.exp(-4.2 * dt));
    s.heading += s.yawRate * dt;

    // Lateral slip out of the turn, shed by the hull's grip.
    s.sway += (-s.yawRate * s.surge * 0.42 - s.sway * 2.8) * dt;

    forward.set(Math.sin(s.heading), 0, Math.cos(s.heading));
    right.set(-Math.cos(s.heading), 0, Math.sin(s.heading));

    let nx = s.x + (forward.x * s.surge + right.x * s.sway) * dt;
    let nz = s.z + (forward.z * s.surge + right.z * s.sway) * dt;

    // Collision with land: slide along the shoreline rather than sticking.
    for (const d of DESTINATIONS) {
      const dx = nx - d.x;
      const dz = nz - d.z;
      const dist = Math.hypot(dx, dz);
      const limit = d.landRadius + 5;
      if (dist < limit && dist > 0.001) {
        nx = d.x + (dx / dist) * limit;
        nz = d.z + (dz / dist) * limit;
        s.surge *= 0.55;
        s.sway *= 0.4;
      }
    }

    // Soft chart boundary: a current that sets the boat back inshore.
    const fromCentre = Math.hypot(nx, nz);
    offChart = fromCentre > WORLD_RADIUS;
    if (offChart) {
      const pull = Math.min(1, (fromCentre - WORLD_RADIUS) / 60);
      nx -= (nx / fromCentre) * pull * 26 * dt;
      nz -= (nz / fromCentre) * pull * 26 * dt;
      s.surge *= 1 - 0.5 * pull * dt;
    }

    s.x = nx;
    s.z = nz;
  }

  function updateBoatPose(time: number, dt: number) {
    const s = boatState;
    const speedN = THREE.MathUtils.clamp(Math.abs(s.surge) / MAX_SPEED, 0, 1);

    // Read the surface at three points to sit the hull in the actual swell.
    const centre = sampleWater(s.x, s.z, time);
    const centreY = centre.height;
    const bowX = s.x + Math.sin(s.heading) * 3.6;
    const bowZ = s.z + Math.cos(s.heading) * 3.6;
    const bowY = waterHeight(bowX, bowZ, time);
    const stbX = s.x - Math.cos(s.heading) * 1.5;
    const stbZ = s.z + Math.sin(s.heading) * 1.5;
    const stbY = waterHeight(stbX, stbZ, time);

    const wavePitch = Math.atan2(bowY - centreY, 3.6);
    const waveRoll = Math.atan2(stbY - centreY, 1.5);

    // Planing attitude plus dynamic heel into the turn.
    const planing = -speedN * 0.1 - Math.max(0, -s.surge) * 0.008;
    const heel = THREE.MathUtils.clamp(-s.yawRate * s.surge * 0.055, -0.4, 0.4);

    const blend = 1 - Math.exp(-7 * dt);
    s.visualPitch += (wavePitch * (1 - speedN * 0.55) + planing - s.visualPitch) * blend;
    s.visualRoll += (waveRoll * (1 - speedN * 0.4) + heel - s.visualRoll) * blend;

    boat.group.position.set(s.x, centreY + 0.42 + speedN * 0.3, s.z);
    boat.group.rotation.set(s.visualPitch, s.heading, s.visualRoll, "YXZ");

    wake.update(time, dt, s.x, s.z, s.heading, s.surge, bowX, bowZ);
    return { speedN, bowX, bowZ, centreY };
  }

  function updateCamera(time: number, dt: number, speedN: number, centreY: number) {
    const s = boatState;
    const sin = Math.sin(s.heading);
    const cos = Math.cos(s.heading);

    if (phase === "intro") {
      introTime += dt;
      const t = Math.min(1, introTime / 6.5);
      const ease = t * t * (3 - 2 * t);
      const angle = s.heading + Math.PI + 0.6 - ease * 0.6;
      const radius = 54 - ease * 32;
      const height = 30 - ease * 22;
      desiredPos.set(s.x + Math.sin(angle) * radius, centreY + height, s.z + Math.cos(angle) * radius);
      desiredLook.set(s.x, centreY + 2.4, s.z);
      if (introTime > 8) setPhase("sailing");
    } else if (phase === "docked" && docked) {
      const d = docked;
      const orbit = d.dockAngle + time * 0.055;
      const radius = d.landRadius + 46;
      desiredPos.set(
        d.x + Math.sin(orbit) * radius,
        24 + d.landRadius * 0.45,
        d.z + Math.cos(orbit) * radius,
      );
      desiredLook.set(d.x, 10 + d.landRadius * 0.3, d.z);
    } else {
      const back = 19 + speedN * 7.5;
      const height = 7.2 + speedN * 2.6;
      // Swing the camera slightly wide of the turn for a sense of weight.
      const swing = THREE.MathUtils.clamp(s.yawRate * 6.5, -4.2, 4.2);
      desiredPos.set(
        s.x - sin * back - cos * swing,
        centreY + height,
        s.z - cos * back + sin * swing,
      );
      desiredLook.set(
        s.x + sin * (10 + speedN * 8),
        centreY + 3.0,
        s.z + cos * (10 + speedN * 8),
      );
    }

    const posBlend = 1 - Math.exp(-(phase === "docked" ? 1.6 : 3.4) * dt);
    const lookBlend = 1 - Math.exp(-(phase === "docked" ? 2.2 : 5.2) * dt);
    camPos.lerp(desiredPos, posBlend);
    camLook.lerp(desiredLook, lookBlend);

    // Keep the camera above the swell so it never dips underwater.
    const minY = waterHeight(camPos.x, camPos.z, time) + 1.8;
    camPos.y = Math.max(camPos.y, minY);

    camera.position.copy(camPos);
    camera.lookAt(camLook);

    const targetFov = phase === "docked" ? 42 : 52 + speedN * 11;
    camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-3 * dt));
    camera.updateProjectionMatrix();
  }

  function updateProximity() {
    let closest: Destination | null = null;
    let closestDistance = Infinity;
    for (const d of DESTINATIONS) {
      const dist = Math.hypot(boatState.x - d.x, boatState.z - d.z);
      if (dist < closestDistance) {
        closestDistance = dist;
        closest = d;
      }
    }
    telemetry.range = closestDistance;
    const candidate =
      closest && closestDistance < closest.discoverRadius ? closest : null;
    if (candidate !== near) {
      near = candidate;
      callbacks.onNearChange(candidate ? candidate.id : null);
    }
  }

  function updateLabels() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    for (const d of DESTINATIONS) {
      const el = callbacks.getLabel(d.id);
      if (!el) continue;
      const anchor = islands.beacons.get(d.id);
      if (!anchor) continue;
      projected.copy(anchor);
      projected.y += 6;
      const distance = camera.position.distanceTo(projected);
      projected.project(camera);

      const visible =
        projected.z < 1 &&
        projected.x > -1.25 &&
        projected.x < 1.25 &&
        projected.y > -1.1 &&
        projected.y < 1.2 &&
        distance < 560 &&
        phase !== "docked";

      if (!visible) {
        if (el.style.opacity !== "0") {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
        }
        continue;
      }

      const x = THREE.MathUtils.clamp(
        (projected.x * 0.5 + 0.5) * width,
        96,
        Math.max(96, width - 96),
      );
      const y = THREE.MathUtils.clamp(
        (-projected.y * 0.5 + 0.5) * height,
        112,
        Math.max(112, height - 150),
      );
      const fade = THREE.MathUtils.clamp(1 - (distance - 340) / 220, 0, 1);
      el.style.visibility = "visible";
      el.style.opacity = fade.toFixed(3);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  }

  function tick(now: number) {
    frameId = requestAnimationFrame(tick);
    const rawDt = (now - lastTime) / 1000;
    lastTime = now;
    if (paused) return;
    if (!resize()) return;

    const dt = Math.min(0.05, Math.max(0.0005, rawDt));
    elapsed += dt;
    const time = elapsed;

    frameAccumulator += rawDt;
    frameCount++;

    stepPhysics(dt);
    const { speedN, centreY } = updateBoatPose(time, dt);
    updateCamera(time, dt, speedN, centreY);
    updateProximity();

    sky.update(time);
    sky.mesh.position.copy(camera.position);
    ocean.update(time, camera.position.x, camera.position.z);
    (ocean.material.uniforms.uCameraPos.value as THREE.Vector3).copy(camera.position);
    props.update(time);

    for (const glow of glowSprites) {
      glow.material.opacity = 0.45 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.6 + glow.phase));
    }
    boat.setLightIntensity(1.1 + 0.4 * Math.sin(time * 2.4));

    // Fade landmark illumination in as it becomes relevant, rather than
    // lighting the whole world and paying for five active point lights.
    let nearestBeacon: (typeof beaconAnchors)[number] | null = null;
    let nearestBeaconDistance = Infinity;
    for (const candidate of beaconAnchors) {
      const distance = camera.position.distanceTo(candidate.position);
      if (distance < nearestBeaconDistance) {
        nearestBeacon = candidate;
        nearestBeaconDistance = distance;
      }
    }
    if (nearestBeacon) {
      beaconAccent.position.copy(nearestBeacon.position);
      beaconAccent.color.set(nearestBeacon.destination.accent);
      beaconAccent.intensity = 11 * (1 - THREE.MathUtils.smoothstep(nearestBeaconDistance, 55, 165));
    }

    if (quality.shadows) {
      // Centring on the docked landmark avoids cutting off its shadows during
      // the orbiting presentation camera; otherwise follow the vessel.
      const shadowX = docked?.x ?? boatState.x;
      const shadowZ = docked?.z ?? boatState.z;
      sun.target.position.set(Math.round(shadowX * 2) / 2, 0, Math.round(shadowZ * 2) / 2);
      sun.target.updateMatrixWorld();
      sun.position.copy(SUN_DIRECTION).multiplyScalar(240).add(sun.target.position);
    }

    updateLabels();
    renderer.render(scene, camera);

    telemetryCountdown -= dt;
    if (telemetryCountdown <= 0) {
      telemetryCountdown = 0.12;
      const fps = frameCount / Math.max(frameAccumulator, 0.0001);
      smoothedFps += (fps - smoothedFps) * 0.25;
      telemetry.heading = (((180 - (boatState.heading * 180) / Math.PI) % 360) + 360) % 360;
      telemetry.knots = Math.abs(boatState.surge) * KNOTS_PER_UNIT;
      telemetry.power = Math.abs(boatState.surge) / MAX_SPEED;
      telemetry.x = boatState.x;
      telemetry.z = boatState.z;
      telemetry.fps = smoothedFps;
      telemetry.offChart = offChart;
      callbacks.onTelemetry(telemetry);
      adaptQuality(smoothedFps);
      frameAccumulator = 0;
      frameCount = 0;
    }
  }

  /** Steps rendering quality down once the measured frame rate cannot hold up. */
  function adaptQuality(fps: number) {
    if (degradeStep >= 2) return;
    slowTicks = fps < 42 ? slowTicks + 1 : Math.max(0, slowTicks - 1);
    if (slowTicks < 20) return;
    slowTicks = 0;
    degradeStep++;
    if (degradeStep === 1) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.0));
      ocean.setDetail(quality.detail * 0.5);
    } else {
      renderer.shadowMap.enabled = false;
      sun.castShadow = false;
      renderer.setPixelRatio(0.8);
    }
  }

  ocean.setDetail(quality.detail);
  scene.fog = new THREE.FogExp2(color(PALETTE.horizon), FOG_DENSITY);
  resize();
  frameId = requestAnimationFrame(tick);
  callbacks.onPhaseChange(phase, null);

  const onVisibility = () => {
    paused = document.hidden;
    if (!paused) lastTime = performance.now();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const handle: WorldHandle = {
    setTouch: (throttle, steer) => input.setTouch(throttle, steer),

    dock() {
      if (phase === "docked" || !near) return;
      docked = near;
      setPhase("docked");
    },

    undock() {
      if (phase !== "docked") return;
      docked = null;
      setPhase("sailing");
    },

    reset() {
      Object.assign(boatState, {
        x: START.x,
        z: START.z,
        heading: START.heading,
        surge: 0,
        sway: 0,
        yawRate: 0,
      });
      wake.reset(START.x, START.z);
      camPos.set(START.x, 20, START.z + 40);
      camLook.set(START.x, 2, START.z);
      docked = null;
      setPhase("sailing");
    },

    setPaused(value) {
      paused = value;
      if (!value) lastTime = performance.now();
    },

    getEnginePower() {
      return Math.abs(boatState.surge) / MAX_SPEED;
    },

    dispose() {
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", onVisibility);
      input.dispose();
      sky.dispose();
      ocean.dispose();
      islands.dispose();
      props.dispose();
      wake.dispose();
      boat.dispose();
      glowTexture.dispose();
      for (const glow of glowSprites) glow.material.dispose();
      envTarget.dispose();
      scene.clear();
      renderer.dispose();
    },
  };

  return handle;
}

/** Soft radial sprite used for the destination navigation lights. */
function createGlowTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.25, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
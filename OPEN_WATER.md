# The Open Water — 3D portfolio prototype

Development branch: `feature/open-water-prototype`.

The homepage is now an explorable 3D maritime environment. It runs in standard browser WebGL without additional dependencies.

## Controls
- W / up: accelerate; S / down: reverse
- A / left: turn port; D / right: turn starboard
- Mobile: press and hold the on-screen touch controls
- Approach the islands to receive a contextual dock link
- Every destination is accessible from the always-visible navigation panel
- Use **Skip exploration** for direct access to projects

## Destinations
Lighthouse → /about; Innovation Island → /projects; Rescue Harbour → /resume; Trading Port → /dashboard; Radio Point → /contact.

## Development
```bash
npm ci
npm run dev
npm run build
```

This proof of concept intentionally uses procedural low-poly geometry, approximate boat handling, flat island terrain, stylized animated water, and a chase camera. Art direction targets cinematic realism plus a restrained navy/teal interface, but production-grade water shaders, wave wakes, custom boat models, real terrain, audio, and further optimization are future work.

## Architecture and constraints
- Existing Next.js App Router routes and SEO metadata preserved.
- No extra npm dependencies or changes to GitHub Pages static export.
- Homepage entrypoint: `src/app/HomeClient.tsx`.
- WebGL scene, world geometry, simulation, and HUD: `src/components/OpenWater.tsx`.
- Runs entirely client-side and preserves existing portfolio pages.
- GPU rendering is not yet tested in CI; verify visually on desktop/mobile.
- Accessibility fallback is the HTML destination navigation, though full keyboard and reduced-motion refinement remain.

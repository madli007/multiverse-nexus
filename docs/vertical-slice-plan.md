# Multiverse Nexus — Vertical Slice Plan

## Experience goal

Build a cinematic, explorable multiverse observatory in which a brilliant central nexus remains the dominant object and a small number of distinct MCU-inspired realities invite focused interaction. The experience should feel like an installation first and an information surface second.

The prototype question is: **can one authored Three.js composition make a central nexus, three different realities, and one focused camera transition feel cinematic without film assets or heavy post-processing?**

## Visual interpretation of the mockup

The supplied mockup uses a wide, symmetrical observatory composition:

- a white-blue core and gold mechanical rings form the brightest, largest focal point;
- dimensional worlds sit on a broad orbit around the centre rather than in a flat row;
- blue, violet, and gold paths repeatedly pull the eye back to the nexus;
- foreground machinery and distant stars create at least three depth planes;
- worlds are readable through silhouettes and internal structure, not colour alone;
- the camera is stable and authored, with a slight low-angle sense of scale.

The implementation will reproduce the hierarchy, atmosphere, depth, circular machinery, energy flow, and framing procedurally. It will not use the mockup as a background or attempt to reproduce its detailed architecture.

Simplifications for the first slice:

- three realities instead of the full orbit;
- symbolic procedural forms instead of miniature landscape scenes;
- additive materials and layered geometry instead of bloom post-processing;
- authored camera interpolation instead of free orbit controls;
- one compact HTML detail surface instead of multiple scene labels.

## MCU visual references

MCU screen canon is the content reference; all visuals remain original abstractions.

- **Sacred Timeline / Earth-616:** protected blue world, restrained gold temporal shell, direct stable connection.
- **The Void:** fractured dark mass, floating debris, decaying green temporal haze.
- **Quantum Realm:** nested translucent layers, inward/outward particles, controlled cyan-magenta bioluminescence.
- **The Nexus:** temporal machinery and branching energy language inspired broadly by *Loki*, dimensional geometry from *Doctor Strange in the Multiverse of Madness*, and branching-reality ideas from *What If...?* and *Avengers: Endgame*.

No actor likenesses, official logos, posters, film footage, dialogue, music, or proprietary models are used. Content is short, original, and explicitly presented as an unofficial fan project.

## Technical approach

- Vite, strict TypeScript, semantic HTML, modern CSS, and Three.js.
- A single WebGL scene with a perspective camera, fog, procedural star fields, additive particles, layered nexus geometry, and tube-based timeline paths.
- Typed local reality data is the source for scene objects, navigation, hover content, selected panels, and camera focus.
- Raycasting supports pointer discovery; an HTML reality selector provides equivalent keyboard access.
- A small camera controller owns the authored default/focus poses and bounded pointer parallax.
- Intro, focus, and return motion use deterministic time-based interpolation; no sequencing dependency is needed for Slice 1.
- Rendering pauses when the page is hidden and recomputes layout on resize.

## Proposed architecture

```text
src/
  main.ts
  styles.css
  data/realities.ts
  state/nexusState.ts
  scene/
    createScene.ts
    createNexus.ts
    createParticles.ts
    createReality.ts
    createRealitySystem.ts
    createTimelinePaths.ts
    sceneTypes.ts
  interaction/
    cameraController.ts
    pointerController.ts
  animation/
    introSequence.ts
  ui/
    createInterface.ts
  utils/
    deviceCapabilities.ts
    math.ts
```

Rendering, state, scene construction, interaction, animation, and interface concerns stay separate. Later slices may introduce specialised reality factories only when their visual complexity justifies the additional modules.

## Major risks

- **Weak hierarchy:** bright reality materials can compete with the nexus. Keep reality light smaller and colours darker than the white nexus core.
- **Transparent overdraw:** shells, paths, and particles can become expensive. Limit layered shells, particle counts, and device pixel ratio.
- **Generic tutorial appearance:** each world needs a different silhouette, motion pattern, atmosphere, and internal detail—not merely another coloured sphere.
- **Selection disorientation:** an over-close camera can lose the nexus. Focus poses keep the selected world and a portion of the nexus in frame.
- **Small-screen occlusion:** a desktop side panel would obscure the scene. Mobile uses a compact bottom sheet and pushes the world composition upward.
- **Raycast-only navigation:** provide semantic reality buttons and Escape/Return controls.
- **Canon ambiguity:** keep the initial content to high-confidence concepts and avoid definitive claims about disputed universe labels.

## Performance strategy

- Clamp device pixel ratio to 1.75 desktop and 1.35 mobile.
- Use device-tier particle counts and reduce motion/detail on mobile or reduced-motion devices.
- Reuse temporary vectors in the animation loop.
- Use `InstancedMesh` for debris and particle point clouds for stars/energy.
- Avoid per-frame geometry/material creation and heavy post-processing.
- Keep transparent layers small and depth writing disabled where appropriate.
- Pause animation when `document.hidden` and update size through one resize handler.
- Dispose renderer resources on page teardown.

## Asset strategy

All first-slice visuals are generated from Three.js geometry, shaders/material parameters, points, and lines. The project ships no external textures, character models, audio, or copied MCU artwork. Future artwork remains optional and replaceable behind local asset modules.

## Accessibility strategy

- Semantic buttons for every reality, selection, return, and intro skip.
- Visible keyboard focus treatment and an HTML live region for hover/selection changes.
- Escape returns to the nexus.
- `prefers-reduced-motion` skips the intro, disables pointer parallax, and reduces ambient motion.
- A WebGL fallback replaces the canvas with a readable reality list and short message.
- Selected reality content remains present in accessible HTML.
- Text maintains high contrast and the interface avoids animation-dependent meaning.

## Acceptance criteria

Slice 1 is complete when:

- the central nexus is clearly the composition’s brightest and dominant object;
- a deep-space field, atmospheric particles, two or more nexus rings, and three connected realities render;
- Sacred Timeline, the Void, and Quantum Realm are distinguishable by form and motion;
- pointer hover and selection work, and the HTML selector offers the same selection;
- camera focus and return are smooth, bounded, and preserve visual context;
- resizing does not lose the scene and mobile retains a deliberate composition;
- reduced-motion and WebGL fallback paths exist;
- strict TypeScript validation and the production build pass;
- default desktop, selected desktop, and mobile views receive visual inspection.

## Vertical slices

### Slice 1 — Convincing Nexus Prototype

Deliver one complete cinematic composition: space, nexus, rings, particles, three distinct realities, state-coded timeline paths, bounded pointer parallax, hover, selection, compact panel, reset/return, short skippable opening, responsive layout, and accessibility basics.

Validation: typecheck, production build, desktop/default screenshot, selected-reality screenshot, mobile screenshot, and visual corrections.

Status: **complete**.

### Slice 2 — MCU Multiverse Explorer

Expand to seven or eight distinct realities. Add specialised procedural factories, projected hover labels, cinematic camera travel, dimming/highlighting, stronger keyboard navigation, and richer but still compact context. Every addition lands as a complete explore/select/return loop.

### Slice 3 — Nexus States

Add stable, branching, and incursion states as transformations of the existing scene. Each state changes path topology, particles, accents, nexus activity, and reality motion while keeping controls and selection functional.

### Slice 4 — Trigger Nexus Event

Add one deterministic, replayable 10–15 second event: pulse, new branch, instability, reaction, then Stabilize or Isolate. Both outcomes restore a coherent scene and can be repeated.

### Slice 5 — Cinematic Journey

Add a short chapter-based camera journey through the existing scene. Each chapter preserves orientation, presents one line of text, and changes emphasis without producing a long scrolling page.

### Slice 6 — Polish and Deployment

Refine animation, loading, intro, device tiers, reduced motion, accessibility, and performance. Complete GitHub Pages workflow, documentation, final cross-size visual QA, and deployment readiness.

## Deviations and decisions

- The prototype skill normally recommends multiple UI variants. The supplied brief already fixes the composition and explicitly requires an immediately working vertical slice, so the prototype is scoped to answering one visual question with one complete authored composition. The resulting code is kept modular and production-valid instead of maintaining throwaway variants.
- Slice 1 avoids bloom/post-processing until direct lighting, additive geometry, and composition have proven the hierarchy.

## Completion notes

Slice 1 completed on 2026-07-23.

- Added a strict Vite/TypeScript/Three.js application with typed local reality data and a small observable selection state.
- Built the Nexus from layered procedural geometry, independently rotating mechanical/energy rings, a luminous core, a wireframe energy shell, axis beams, lights, haze, stars, and atmospheric dust.
- Built three distinct reality languages: vertex-coloured protected Earth with a temporal shell, fractured Void wasteland with instanced debris and broken orbit, and a nested Quantum Realm with shells, a torus-knot strand, and inward/outward points.
- Connected every reality to the Nexus with two-strand procedural paths and travelling energy pulses sourced from the same typed data.
- Added raycast hover/click, equivalent semantic HTML controls, selected-state dimming/highlighting, Escape/Return, bounded pointer parallax, and authored focus poses.
- Added a deterministic 6.4 second opening with a skip control and reduced-motion bypass.
- Added compact desktop panels, mobile bottom panels, visible focus states, WebGL fallback content, and the required fan-project disclaimer.
- Added Vite project-base configuration and a concise project README.
- `npm run typecheck` passes.
- `npm run build` passes. The generated Three.js application chunk is approximately 524 kB before gzip and 135 kB gzip; later slices should split optional simulation/journey modules if they materially increase the initial payload.
- Browser review covered 1440×900 default, 1440×900 Earth-616 focus, alternate-side Quantum Realm focus, 390×844 default, and 390×844 selected views.
- Visual-review fixes enlarged and enriched the Nexus, reduced the marketing-title scale, preserved more Nexus context in focus mode, moved the panel opposite right-side realities, reduced close-up path-pulse size, and removed mobile horizontal overflow.
- Browser console review found no errors or warnings.

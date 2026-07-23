# Multiverse Nexus

An unofficial, non-commercial MCU-inspired fan experience built as a cinematic multiverse observatory. The Three.js scene centres a procedural temporal nexus, connected realities, and compact contextual interaction rather than encyclopedic content.

## Current vertical slice

Slice 1 proves the core visual and interaction direction:

- full-screen procedural deep-space scene;
- animated central nexus with mechanical and energy rings;
- Sacred Timeline / Earth-616, the Void, and Quantum Realm;
- state-coloured timeline paths and travelling energy pulses;
- pointer hover, click selection, HTML reality navigation, and Escape return;
- authored camera focus, bounded pointer parallax, and a skippable opening;
- responsive desktop/mobile layouts and reduced-motion support;
- WebGL fallback and semantic controls.

Screenshot placeholder: `docs/screenshots/nexus-default.png`

## Technology

Vite, strict TypeScript, Three.js, semantic HTML, and modern CSS. Visual assets are generated from geometry, points, lines, instancing, lights, and materials; the project bundles no film footage, posters, soundtrack recordings, actor likenesses, or proprietary 3D models.

## Local development

```bash
npm install
npm run dev
```

Vite serves the project below the configured `/multiverse-nexus/` base path.

## Validation and production build

```bash
npm run typecheck
npm run build
npm run preview
```

The production output is written to `dist/`.

## Controls

- Move the pointer for restrained camera parallax.
- Hover a reality to inspect its state.
- Click a reality—or use the HTML reality index—to focus it.
- Use **Return to Nexus** or press `Escape` to restore the full composition.
- Use **Skip intro** to enter the observatory immediately.

## Structure

```text
src/
  animation/      opening sequence
  data/           typed MCU reality content
  interaction/    authored camera and pointer raycasting
  scene/          Nexus, worlds, paths, particles, renderer
  state/          small observable interaction state
  ui/             semantic interface construction
  utils/          capability detection and math
```

The visual plan, risks, acceptance criteria, and phased roadmap live in
[`docs/vertical-slice-plan.md`](docs/vertical-slice-plan.md).

## Performance and accessibility

The renderer clamps device pixel ratio, lowers particle density on mobile, pauses work in hidden tabs, avoids heavy post-processing, and disposes scene resources. Essential reality navigation is available through HTML buttons, focus states are visible, Escape is supported, reduced-motion skips the intro and parallax, and a text fallback is shown if WebGL initialization fails.

## GitHub Pages

`vite.config.ts` uses the project base path `/multiverse-nexus/`, suitable for a repository URL such as:

```text
https://username.github.io/multiverse-nexus/
```

The included `.github/workflows/deploy.yml` validates, builds, uploads `dist/`,
and deploys it with the official GitHub Pages actions whenever `main` is pushed.

In the repository, open **Settings → Pages** and set **Build and deployment →
Source** to **GitHub Actions**. The first successful workflow run publishes the
site at:

```text
https://madli007.github.io/multiverse-nexus/
```

## Fan-project disclaimer

Multiverse Nexus is an unofficial, non-commercial fan project. Marvel, the Marvel Cinematic Universe, and all related properties belong to their respective owners. This project is not affiliated with or endorsed by Marvel Studios or Disney.

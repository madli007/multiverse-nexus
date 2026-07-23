import type { McuReality } from "../data/realities";
import { getReality } from "../data/realities";
import type { NexusSnapshot, NexusStore } from "../state/nexusState";

export interface InterfaceController {
  readonly setPointerPosition: (x: number, y: number) => void;
  readonly setIntroProgress: (progress: number) => void;
  readonly dispose: () => void;
}

interface InterfaceOptions {
  readonly root: HTMLElement;
  readonly store: NexusStore;
  readonly realities: readonly McuReality[];
  readonly onSkipIntro: () => void;
}

function typeLabel(reality: McuReality): string {
  return reality.type.replace("-", " ");
}

function actionLabel(reality: McuReality): string {
  switch (reality.state) {
    case "stable":
      return "Inspect timeline";
    case "branching":
      return "Inspect branch";
    case "unstable":
      return "Isolate anomaly";
    case "incursion":
      return "Observe incursion";
    case "isolated":
      return "Restore connection";
    case "collapsed":
      return "Review echo";
  }
}

export function createInterface(options: InterfaceOptions): InterfaceController {
  const overlay = document.createElement("div");
  overlay.className = "interface";
  overlay.innerHTML = `
    <header class="brand" aria-label="Experience title">
      <span class="brand__eyebrow">Temporal observation array</span>
      <span class="brand__title">Multiverse <i>Nexus</i></span>
    </header>

    <div class="nexus-status" aria-label="Current nexus state">
      <span class="status-dot"></span>
      <span>Nexus state</span>
      <strong>Stable</strong>
    </div>

    <section class="hero-copy" aria-labelledby="hero-heading">
      <p class="hero-copy__index">NEXUS // 616.A</p>
      <h1 id="hero-heading">Observe the<br />infinite possible.</h1>
      <p class="hero-copy__hint">Trace a current. Select a reality.</p>
      <button class="button button--primary" type="button" data-action="explore">
        <span>Explore Earth-616</span><span aria-hidden="true">↗</span>
      </button>
    </section>

    <aside class="reality-panel" aria-live="polite" aria-hidden="true">
      <button class="icon-button reality-panel__close" type="button" data-action="reset" aria-label="Return to Nexus">×</button>
      <p class="reality-panel__type"></p>
      <h2 class="reality-panel__title"></h2>
      <p class="reality-panel__description"></p>
      <div class="reality-panel__status">
        <span>Status</span>
        <strong></strong>
        <span class="stability-value"></span>
      </div>
      <div class="stability-track" aria-hidden="true"><span></span></div>
      <dl class="reality-panel__references">
        <div><dt>Observed in</dt><dd data-field="projects"></dd></div>
        <div><dt>Signatures</dt><dd data-field="signatures"></dd></div>
      </dl>
      <button class="button button--primary reality-panel__action" type="button" data-action="context"></button>
      <button class="button button--quiet" type="button" data-action="reset">← Return to Nexus</button>
    </aside>

    <nav class="reality-nav" aria-label="Reality selector">
      <span class="reality-nav__label">Reality index</span>
      <div class="reality-nav__items"></div>
    </nav>

    <div class="hover-label" role="status" aria-hidden="true">
      <span class="hover-label__type"></span>
      <strong></strong>
      <small></small>
    </div>

    <p class="interaction-hint"><span></span>Move to observe</p>

    <footer class="legal">
      Multiverse Nexus is an unofficial, non-commercial fan project. Marvel, the Marvel Cinematic Universe, and all related properties belong to their respective owners. This project is not affiliated with or endorsed by Marvel Studios or Disney.
    </footer>

    <div class="sr-only" aria-live="polite" data-live-region></div>

    <section class="intro" aria-label="Opening sequence">
      <div class="intro__reticle" aria-hidden="true"><span></span><span></span></div>
      <p class="intro__chapter">Beyond space. Beyond time.</p>
      <div class="intro__progress" aria-hidden="true"><span></span></div>
      <button class="button button--quiet intro__skip" type="button" data-action="skip-intro">Skip intro</button>
    </section>
  `;
  options.root.append(overlay);

  const hero = overlay.querySelector<HTMLElement>(".hero-copy")!;
  const panel = overlay.querySelector<HTMLElement>(".reality-panel")!;
  const tooltip = overlay.querySelector<HTMLElement>(".hover-label")!;
  const tooltipType = tooltip.querySelector<HTMLElement>(".hover-label__type")!;
  const tooltipName = tooltip.querySelector<HTMLElement>("strong")!;
  const tooltipStability = tooltip.querySelector<HTMLElement>("small")!;
  const liveRegion = overlay.querySelector<HTMLElement>("[data-live-region]")!;
  const navItems = overlay.querySelector<HTMLElement>(".reality-nav__items")!;
  const intro = overlay.querySelector<HTMLElement>(".intro")!;
  const introChapter = intro.querySelector<HTMLElement>(".intro__chapter")!;
  const introProgress = intro.querySelector<HTMLElement>(".intro__progress span")!;

  const navButtons = new Map<string, HTMLButtonElement>();
  options.realities.forEach((reality, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "reality-nav__item";
    button.dataset["realityId"] = reality.id;
    button.setAttribute(
      "aria-label",
      `${reality.name}, ${reality.stability}% stability`,
    );
    button.innerHTML = `<span>0${index + 1}</span><strong></strong><i aria-hidden="true"></i>`;
    button.querySelector("strong")!.textContent = reality.shortName;
    button.style.setProperty("--reality-colour", reality.accentColor);
    button.addEventListener("click", () => options.store.select(reality));
    button.addEventListener("mouseenter", () => options.store.hover(reality));
    button.addEventListener("mouseleave", () => options.store.hover(null));
    navItems.append(button);
    navButtons.set(reality.id, button);
  });

  const renderPanel = (reality: McuReality): void => {
    panel.querySelector<HTMLElement>(".reality-panel__type")!.textContent =
      `${typeLabel(reality)} // ${reality.state}`;
    panel.querySelector<HTMLElement>(".reality-panel__title")!.textContent = reality.name;
    panel.querySelector<HTMLElement>(".reality-panel__description")!.textContent =
      reality.shortDescription;
    panel.querySelector<HTMLElement>(".reality-panel__status strong")!.textContent =
      reality.state;
    panel.querySelector<HTMLElement>(".stability-value")!.textContent =
      `${reality.stability}% stability`;
    panel.querySelector<HTMLElement>(".stability-track span")!.style.width =
      `${reality.stability}%`;
    panel.querySelector<HTMLElement>('[data-field="projects"]')!.textContent =
      reality.relatedProjects.slice(0, 2).join(" · ");
    panel.querySelector<HTMLElement>('[data-field="signatures"]')!.textContent = [
      ...reality.notableCharacters,
      ...reality.notableEvents,
    ]
      .slice(0, 3)
      .join(" · ");
    panel.querySelector<HTMLButtonElement>(".reality-panel__action")!.textContent =
      actionLabel(reality);
  };

  const render = (snapshot: NexusSnapshot): void => {
    const selected = snapshot.selectedRealityId
      ? getReality(snapshot.selectedRealityId)
      : undefined;
    const hovered = snapshot.hoveredRealityId
      ? getReality(snapshot.hoveredRealityId)
      : undefined;

    overlay.classList.toggle("is-focused", selected !== undefined);
    overlay.classList.toggle(
      "is-panel-left",
      selected !== undefined && selected.position[0] > 0,
    );
    hero.setAttribute("aria-hidden", selected ? "true" : "false");
    panel.setAttribute("aria-hidden", selected ? "false" : "true");

    if (selected) {
      renderPanel(selected);
      liveRegion.textContent = `${selected.name} selected. ${selected.stability}% stability.`;
    }

    if (hovered && !selected) {
      tooltipType.textContent = typeLabel(hovered);
      tooltipName.textContent = hovered.shortName;
      tooltipStability.textContent = `${hovered.stability}% stability`;
      tooltip.setAttribute("aria-hidden", "false");
    } else {
      tooltip.setAttribute("aria-hidden", "true");
    }

    navButtons.forEach((button, realityId) => {
      button.classList.toggle("is-active", realityId === selected?.id);
      button.setAttribute("aria-pressed", String(realityId === selected?.id));
    });
  };

  const unsubscribe = options.store.subscribe(render);

  overlay.querySelectorAll<HTMLElement>('[data-action="reset"]').forEach((button) => {
    button.addEventListener("click", options.store.reset);
  });
  overlay
    .querySelector<HTMLElement>('[data-action="explore"]')!
    .addEventListener("click", () => options.store.select(options.realities[0]!));
  overlay
    .querySelector<HTMLElement>('[data-action="context"]')!
    .addEventListener("click", () => {
      const selectedId = options.store.getSnapshot().selectedRealityId;
      const reality = selectedId ? getReality(selectedId) : undefined;
      if (reality) {
        liveRegion.textContent = `${actionLabel(reality)} initiated for ${reality.name}.`;
        panel.classList.remove("is-pulsing");
        requestAnimationFrame(() => panel.classList.add("is-pulsing"));
      }
    });
  overlay
    .querySelector<HTMLElement>('[data-action="skip-intro"]')!
    .addEventListener("click", options.onSkipIntro);

  return {
    setPointerPosition: (x, y) => {
      tooltip.style.setProperty("--pointer-x", `${x}px`);
      tooltip.style.setProperty("--pointer-y", `${y}px`);
    },
    setIntroProgress: (progress) => {
      const percent = Math.round(progress * 100);
      introProgress.style.width = `${percent}%`;
      intro.style.setProperty("--intro-progress", String(progress));
      intro.classList.toggle("is-complete", progress >= 1);
      if (progress < 0.22) introChapter.textContent = "Beyond space. Beyond time.";
      else if (progress < 0.43) introChapter.textContent = "The Nexus awakens.";
      else if (progress < 0.67) introChapter.textContent = "Timelines answer.";
      else introChapter.textContent = "Observation array online.";
    },
    dispose: () => {
      unsubscribe();
      overlay.remove();
    },
  };
}

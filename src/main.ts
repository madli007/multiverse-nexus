import "./styles.css";
import { createIntroSequence } from "./animation/introSequence";
import { realities } from "./data/realities";
import { createCameraController } from "./interaction/cameraController";
import { createPointerController } from "./interaction/pointerController";
import { createScene } from "./scene/createScene";
import { createNexusStore } from "./state/nexusState";
import { createInterface } from "./ui/createInterface";
import { detectDeviceCapabilities } from "./utils/deviceCapabilities";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Application root was not found.");

function renderWebGlFallback(container: HTMLElement): void {
  container.innerHTML = `
    <section class="webgl-fallback">
      <p class="brand__eyebrow">Temporal observation array offline</p>
      <h1>Multiverse Nexus</h1>
      <p>This browser could not start the WebGL observatory. You can still review the detected realities below.</p>
      <ul></ul>
    </section>
  `;
  const list = container.querySelector("ul")!;
  realities.forEach((reality) => {
    const item = document.createElement("li");
    item.textContent = `${reality.name} — ${reality.state}, ${reality.stability}% stability`;
    list.append(item);
  });
}

const canvas = document.createElement("canvas");
canvas.className = "nexus-canvas";
canvas.setAttribute("aria-hidden", "true");
root.append(canvas);

const capabilities = detectDeviceCapabilities();
const store = createNexusStore();

try {
  const nexusScene = createScene(canvas, capabilities);
  const cameraController = createCameraController(nexusScene.camera, capabilities);
  let introSequence: ReturnType<typeof createIntroSequence>;

  const interfaceController = createInterface({
    root,
    store,
    realities,
    onSkipIntro: () => introSequence.skip(),
  });

  introSequence = createIntroSequence(capabilities.reducedMotion, (progress) => {
    nexusScene.setIntroProgress(progress);
    cameraController.setIntroProgress(progress);
    interfaceController.setIntroProgress(progress);
  });

  const realitiesById = new Map(realities.map((reality) => [reality.id, reality]));
  const pointerController = createPointerController({
    canvas,
    camera: nexusScene.camera,
    hitTargets: nexusScene.realitySystem.hitTargets,
    realitiesById,
    onHover: store.hover,
    onSelect: store.select,
    onPointerPosition: (x, y, normalizedX, normalizedY) => {
      interfaceController.setPointerPosition(x, y);
      cameraController.setPointer(normalizedX, normalizedY);
    },
  });

  const unsubscribeScene = store.subscribe((snapshot) => {
    nexusScene.realitySystem.setInteractionState(
      snapshot.hoveredRealityId,
      snapshot.selectedRealityId,
    );
    if (snapshot.selectedRealityId) {
      const reality = realitiesById.get(snapshot.selectedRealityId);
      if (reality) cameraController.focus(reality);
    } else {
      cameraController.reset();
    }
  });

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && store.getSnapshot().selectedRealityId) {
      store.reset();
    }
  };
  const handleResize = (): void => nexusScene.resize();
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleResize, { passive: true });

  let animationFrame = 0;
  let startTime = performance.now();
  let previousTime = startTime;

  const animate = (time: number): void => {
    animationFrame = requestAnimationFrame(animate);
    if (document.hidden) {
      previousTime = time;
      return;
    }

    const elapsed = Math.max(0, (time - startTime) / 1000);
    const delta = Math.min(0.05, Math.max(0, (time - previousTime) / 1000));
    previousTime = time;

    if (!introSequence.isComplete()) {
      introSequence.update(elapsed);
    }
    cameraController.update(delta);
    nexusScene.render(elapsed, capabilities.reducedMotion ? Math.min(delta, 0.008) : delta);
  };
  animationFrame = requestAnimationFrame(animate);

  const handleVisibility = (): void => {
    if (!document.hidden) {
      const now = performance.now();
      const pausedFor = now - previousTime;
      startTime += Math.max(0, pausedFor);
      previousTime = now;
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);

  window.addEventListener(
    "beforeunload",
    () => {
      cancelAnimationFrame(animationFrame);
      unsubscribeScene();
      pointerController.dispose();
      interfaceController.dispose();
      nexusScene.dispose();
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    },
    { once: true },
  );
} catch (error: unknown) {
  console.error("Unable to initialize Multiverse Nexus.", error);
  renderWebGlFallback(root);
}

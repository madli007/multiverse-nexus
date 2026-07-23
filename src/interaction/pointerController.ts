import * as THREE from "three";
import type { McuReality } from "../data/realities";

export interface PointerController {
  readonly dispose: () => void;
}

interface PointerControllerOptions {
  readonly canvas: HTMLCanvasElement;
  readonly camera: THREE.PerspectiveCamera;
  readonly hitTargets: readonly THREE.Object3D[];
  readonly realitiesById: ReadonlyMap<string, McuReality>;
  readonly onHover: (reality: McuReality | null) => void;
  readonly onSelect: (reality: McuReality) => void;
  readonly onPointerPosition: (x: number, y: number, normalizedX: number, normalizedY: number) => void;
}

export function createPointerController(options: PointerControllerOptions): PointerController {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(2, 2);
  const hitTargets = [...options.hitTargets];
  let hoveredId: string | null = null;

  const readHit = (): McuReality | null => {
    raycaster.setFromCamera(pointer, options.camera);
    const hit = raycaster.intersectObjects(hitTargets, false)[0];
    const id = hit?.object.userData["realityId"];
    return typeof id === "string" ? (options.realitiesById.get(id) ?? null) : null;
  };

  const handlePointerMove = (event: PointerEvent): void => {
    const bounds = options.canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    options.onPointerPosition(event.clientX, event.clientY, pointer.x, pointer.y);

    const reality = readHit();
    if ((reality?.id ?? null) !== hoveredId) {
      hoveredId = reality?.id ?? null;
      options.canvas.classList.toggle("is-hovering-reality", reality !== null);
      options.onHover(reality);
    }
  };

  const handlePointerLeave = (): void => {
    pointer.set(2, 2);
    hoveredId = null;
    options.canvas.classList.remove("is-hovering-reality");
    options.onHover(null);
  };

  const handleClick = (): void => {
    const reality = readHit();
    if (reality) options.onSelect(reality);
  };

  options.canvas.addEventListener("pointermove", handlePointerMove);
  options.canvas.addEventListener("pointerleave", handlePointerLeave);
  options.canvas.addEventListener("click", handleClick);

  return {
    dispose: () => {
      options.canvas.removeEventListener("pointermove", handlePointerMove);
      options.canvas.removeEventListener("pointerleave", handlePointerLeave);
      options.canvas.removeEventListener("click", handleClick);
    },
  };
}

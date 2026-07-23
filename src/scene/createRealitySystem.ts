import * as THREE from "three";
import type { McuReality } from "../data/realities";
import type { RealityVisual, TimelineVisual } from "./sceneTypes";
import { createRealityVisual } from "./createReality";
import { createTimelinePath } from "./createTimelinePaths";

export interface RealitySystem {
  readonly object: THREE.Group;
  readonly realities: readonly RealityVisual[];
  readonly timelines: readonly TimelineVisual[];
  readonly hitTargets: readonly THREE.Object3D[];
  readonly update: (elapsed: number, delta: number) => void;
  readonly setInteractionState: (
    hoveredRealityId: string | null,
    selectedRealityId: string | null,
  ) => void;
}

export function createRealitySystem(data: readonly McuReality[]): RealitySystem {
  const group = new THREE.Group();
  const realityVisuals = data.map(createRealityVisual);
  const timelines = data.map(createTimelinePath);

  timelines.forEach((timeline) => group.add(timeline.object));
  realityVisuals.forEach((reality) => group.add(reality.object));

  return {
    object: group,
    realities: realityVisuals,
    timelines,
    hitTargets: realityVisuals.flatMap((reality) => reality.hitTargets),
    update: (elapsed, delta) => {
      realityVisuals.forEach((reality) => reality.update(elapsed, delta));
      timelines.forEach((timeline) => timeline.update(elapsed, delta));
    },
    setInteractionState: (hoveredRealityId, selectedRealityId) => {
      realityVisuals.forEach((reality) => {
        const selected = reality.data.id === selectedRealityId;
        const hovered = reality.data.id === hoveredRealityId;
        const dimmed = selectedRealityId !== null && !selected;
        reality.setInteractionState(hovered, selected, dimmed);
      });
      timelines.forEach((timeline) => {
        const highlighted =
          timeline.realityId === (selectedRealityId ?? hoveredRealityId);
        const dimmed = selectedRealityId !== null && timeline.realityId !== selectedRealityId;
        timeline.setInteractionState(highlighted, dimmed);
      });
    },
  };
}

import type * as THREE from "three";
import type { McuReality } from "../data/realities";

export interface AnimatedSceneObject {
  readonly object: THREE.Object3D;
  readonly update: (elapsed: number, delta: number) => void;
}

export interface RealityVisual extends AnimatedSceneObject {
  readonly data: McuReality;
  readonly hitTargets: readonly THREE.Object3D[];
  readonly focusPoint: THREE.Vector3;
  setInteractionState(hovered: boolean, selected: boolean, dimmed: boolean): void;
}

export interface TimelineVisual extends AnimatedSceneObject {
  readonly realityId: string;
  setInteractionState(highlighted: boolean, dimmed: boolean): void;
}

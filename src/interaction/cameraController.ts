import * as THREE from "three";
import type { McuReality } from "../data/realities";
import type { DeviceCapabilities } from "../utils/deviceCapabilities";
import { damp, easeInOutCubic } from "../utils/math";

export interface CameraController {
  readonly focus: (reality: McuReality) => void;
  readonly reset: () => void;
  readonly setPointer: (x: number, y: number) => void;
  readonly setIntroProgress: (progress: number) => void;
  readonly update: (delta: number) => void;
}

export function createCameraController(
  camera: THREE.PerspectiveCamera,
  capabilities: DeviceCapabilities,
): CameraController {
  const defaultPosition = new THREE.Vector3(0, 1.1, capabilities.isMobile ? 23 : 18);
  const defaultLookAt = new THREE.Vector3(0, -0.05, 0);
  const targetPosition = defaultPosition.clone();
  const targetLookAt = defaultLookAt.clone();
  const currentLookAt = defaultLookAt.clone();
  const introStart = new THREE.Vector3(0, 0.4, capabilities.isMobile ? 34 : 30);
  const pointer = new THREE.Vector2();
  let introProgress = capabilities.reducedMotion ? 1 : 0;
  let focused = false;

  return {
    focus: (reality) => {
      focused = true;
      const [x, y, z] = reality.position;
      targetPosition.set(
        x * 0.4,
        y * 0.42 + 0.75,
        z + (capabilities.isMobile ? 10.5 : 8.2),
      );
      targetLookAt.set(x * 0.34, y * 0.46, z * 0.8);
    },
    reset: () => {
      focused = false;
      targetPosition.copy(defaultPosition);
      targetLookAt.copy(defaultLookAt);
    },
    setPointer: (x, y) => {
      pointer.set(x, y);
    },
    setIntroProgress: (progress) => {
      introProgress = progress;
    },
    update: (delta) => {
      if (introProgress < 1) {
        const eased = easeInOutCubic(introProgress);
        camera.position.lerpVectors(introStart, defaultPosition, eased);
        currentLookAt.lerpVectors(
          new THREE.Vector3(0, 0, -4),
          defaultLookAt,
          eased,
        );
        camera.lookAt(currentLookAt);
        return;
      }

      const parallaxX =
        !focused && !capabilities.reducedMotion && !capabilities.isMobile ? pointer.x * 0.38 : 0;
      const parallaxY =
        !focused && !capabilities.reducedMotion && !capabilities.isMobile ? pointer.y * 0.22 : 0;
      camera.position.x = damp(camera.position.x, targetPosition.x + parallaxX, 3.2, delta);
      camera.position.y = damp(camera.position.y, targetPosition.y + parallaxY, 3.2, delta);
      camera.position.z = damp(camera.position.z, targetPosition.z, 3.2, delta);
      currentLookAt.x = damp(currentLookAt.x, targetLookAt.x, 3.8, delta);
      currentLookAt.y = damp(currentLookAt.y, targetLookAt.y, 3.8, delta);
      currentLookAt.z = damp(currentLookAt.z, targetLookAt.z, 3.8, delta);
      camera.lookAt(currentLookAt);
    },
  };
}

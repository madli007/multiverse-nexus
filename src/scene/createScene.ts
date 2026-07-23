import * as THREE from "three";
import { realities } from "../data/realities";
import type { DeviceCapabilities } from "../utils/deviceCapabilities";
import { createAtmosphericDust, createStarField } from "./createParticles";
import { createNexus } from "./createNexus";
import { createRealitySystem, type RealitySystem } from "./createRealitySystem";

export interface NexusScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly realitySystem: RealitySystem;
  readonly resize: () => void;
  readonly render: (elapsed: number, delta: number) => void;
  readonly setIntroProgress: (progress: number) => void;
  readonly dispose: () => void;
}

function addCosmicHaze(scene: THREE.Scene): THREE.Group {
  const haze = new THREE.Group();
  const colours = ["#173d82", "#4d1f74", "#0a5072"];
  const positions: readonly [number, number, number][] = [
    [-10, 4, -12],
    [9, -4, -14],
    [0, 6, -20],
  ];

  colours.forEach((colour, index) => {
    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(5 + index * 1.2, 24, 16),
      new THREE.MeshBasicMaterial({
        color: colour,
        transparent: true,
        opacity: 0.025,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    cloud.position.set(...positions[index]!);
    cloud.scale.set(1.8, 0.55, 1);
    haze.add(cloud);
  });
  scene.add(haze);
  return haze;
}

export function createScene(
  canvas: HTMLCanvasElement,
  capabilities: DeviceCapabilities,
): NexusScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !capabilities.isMobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(capabilities.pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#01020a");
  scene.fog = new THREE.FogExp2("#030713", 0.017);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1.15, capabilities.isMobile ? 23 : 18);

  const ambientLight = new THREE.AmbientLight("#5275a8", 0.82);
  scene.add(ambientLight);
  const keyLight = new THREE.DirectionalLight("#9ecfff", 2.2);
  keyLight.position.set(-5, 8, 9);
  scene.add(keyLight);

  const starField = createStarField(
    Math.round(1550 * capabilities.particleMultiplier),
  );
  scene.add(starField.object);
  const dust = createAtmosphericDust(
    Math.round(380 * capabilities.particleMultiplier),
  );
  scene.add(dust.object);
  const haze = addCosmicHaze(scene);

  const nexus = createNexus();
  const nexusBaseScale = capabilities.isMobile ? 1.14 : 1.22;
  nexus.object.scale.setScalar(nexusBaseScale);
  scene.add(nexus.object);

  const realitySystem = createRealitySystem(realities);
  scene.add(realitySystem.object);

  const resize = (): void => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 720 ? 54 : 45;
    camera.updateProjectionMatrix();
  };

  const setIntroProgress = (progress: number): void => {
    const nexusVisible = progress > 0.27;
    nexus.object.visible = nexusVisible;
    if (nexusVisible && progress < 0.48) {
      nexus.object.scale.setScalar(
        nexusBaseScale * Math.max(0.02, (progress - 0.27) / 0.21),
      );
    } else {
      nexus.object.scale.setScalar(nexusBaseScale);
    }
    realitySystem.timelines.forEach((timeline) => {
      timeline.object.visible = progress > 0.51;
    });
    realitySystem.realities.forEach((reality, index) => {
      reality.object.visible = progress > 0.66 + index * 0.055;
    });
  };

  const render = (elapsed: number, delta: number): void => {
    starField.update(elapsed, delta);
    dust.update(elapsed, delta);
    nexus.update(elapsed, delta);
    realitySystem.update(elapsed, delta);
    haze.rotation.z = Math.sin(elapsed * 0.025) * 0.035;
    renderer.render(scene, camera);
  };

  const dispose = (): void => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        object.geometry.dispose();
        const objectMaterial = object.material as THREE.Material | THREE.Material[];
        const materials = Array.isArray(objectMaterial) ? objectMaterial : [objectMaterial];
        materials.forEach((material) => material.dispose());
      }
    });
    renderer.dispose();
  };

  resize();
  return {
    renderer,
    scene,
    camera,
    realitySystem,
    resize,
    render,
    setIntroProgress,
    dispose,
  };
}

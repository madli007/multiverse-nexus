import * as THREE from "three";
import type { AnimatedSceneObject } from "./sceneTypes";

function createRing(
  radius: number,
  tube: number,
  colour: string,
  opacity: number,
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 8, 128),
    new THREE.MeshBasicMaterial({
      color: colour,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
}

function createMechanicalSegments(radius: number, count: number): THREE.Group {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.72, 0.12, 0.17);
  const material = new THREE.MeshStandardMaterial({
    color: "#56482f",
    emissive: "#a66d1f",
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.28,
  });

  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    const segment = new THREE.Mesh(geometry, material);
    segment.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    segment.rotation.z = angle;
    group.add(segment);
  }

  return group;
}

export function createNexus(): AnimatedSceneObject {
  const nexus = new THREE.Group();
  nexus.name = "Central Nexus";

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.15, 48, 32),
    new THREE.MeshBasicMaterial({
      color: "#2275dc",
      transparent: true,
      opacity: 0.075,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  nexus.add(halo);

  const outerHalo = new THREE.Mesh(
    new THREE.SphereGeometry(2.7, 36, 24),
    new THREE.MeshBasicMaterial({
      color: "#174889",
      transparent: true,
      opacity: 0.035,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  outerHalo.scale.set(1, 0.78, 1);
  nexus.add(outerHalo);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.64, 5),
    new THREE.MeshBasicMaterial({
      color: "#e9faff",
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
    }),
  );
  nexus.add(core);

  const energyShell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.03, 2),
    new THREE.MeshBasicMaterial({
      color: "#69c8ff",
      transparent: true,
      opacity: 0.18,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  nexus.add(energyShell);

  const innerCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 16),
    new THREE.MeshBasicMaterial({ color: "#ffffff" }),
  );
  nexus.add(innerCore);

  const equatorialRing = createRing(2.38, 0.065, "#d3a250", 0.9);
  equatorialRing.rotation.x = Math.PI / 2;
  nexus.add(equatorialRing);

  const diagonalRing = createRing(1.87, 0.035, "#62c8ff", 0.85);
  diagonalRing.rotation.set(Math.PI / 2.8, 0.4, 0.2);
  nexus.add(diagonalRing);

  const verticalRing = createRing(1.55, 0.028, "#ab77ff", 0.62);
  verticalRing.rotation.y = Math.PI / 2;
  nexus.add(verticalRing);

  const mechanics = createMechanicalSegments(2.1, 18);
  nexus.add(mechanics);

  const innerMechanics = createMechanicalSegments(1.14, 12);
  innerMechanics.rotation.x = Math.PI / 2;
  nexus.add(innerMechanics);

  const axisGeometry = new THREE.CylinderGeometry(0.025, 0.025, 7, 8);
  const axisMaterial = new THREE.MeshBasicMaterial({
    color: "#eab95d",
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });
  const axis = new THREE.Mesh(axisGeometry, axisMaterial);
  nexus.add(axis);

  const pointLight = new THREE.PointLight("#91d9ff", 35, 16, 1.6);
  nexus.add(pointLight);
  const warmLight = new THREE.PointLight("#edb052", 18, 12, 2);
  warmLight.position.set(0, -1.8, 1);
  nexus.add(warmLight);

  return {
    object: nexus,
    update: (elapsed, delta) => {
      equatorialRing.rotation.z += delta * 0.045;
      diagonalRing.rotation.z -= delta * 0.08;
      verticalRing.rotation.x += delta * 0.055;
      mechanics.rotation.z -= delta * 0.028;
      innerMechanics.rotation.y += delta * 0.09;
      core.rotation.y += delta * 0.12;
      energyShell.rotation.x -= delta * 0.055;
      energyShell.rotation.y += delta * 0.075;

      const pulse = 1 + Math.sin(elapsed * 1.7) * 0.055;
      core.scale.setScalar(pulse);
      halo.scale.setScalar(1 + Math.sin(elapsed * 0.72) * 0.04);
      pointLight.intensity = 32 + Math.sin(elapsed * 1.7) * 4;
    },
  };
}

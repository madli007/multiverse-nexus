import * as THREE from "three";
import type { AnimatedSceneObject } from "./sceneTypes";

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function createStarField(count: number): AnimatedSceneObject {
  const random = seededRandom(611);
  const positions = new Float32Array(count * 3);
  const colours = new Float32Array(count * 3);
  const colour = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const radius = 19 + random() * 28;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const offset = index * 3;

    positions[offset] = radius * Math.sin(phi) * Math.cos(theta);
    positions[offset + 1] = radius * Math.cos(phi) * 0.64;
    positions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta) - 7;

    colour.set(random() > 0.82 ? "#9ac9ff" : random() > 0.9 ? "#e7c789" : "#b8c4dc");
    colour.multiplyScalar(0.45 + random() * 0.55);
    colours[offset] = colour.r;
    colours[offset + 1] = colour.g;
    colours[offset + 2] = colour.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));

  const material = new THREE.PointsMaterial({
    size: 0.055,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.82,
    vertexColors: true,
    depthWrite: false,
  });
  const stars = new THREE.Points(geometry, material);

  return {
    object: stars,
    update: (_elapsed, delta) => {
      stars.rotation.y += delta * 0.002;
    },
  };
}

export function createAtmosphericDust(count: number): AnimatedSceneObject {
  const random = seededRandom(719);
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const radii = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const radius = 3.2 + random() * 8.5;
    const angle = random() * Math.PI * 2;
    const offset = index * 3;
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = (random() - 0.5) * 6;
    positions[offset + 2] = Math.sin(angle) * radius * 0.38;
    phases[index] = angle;
    radii[index] = radius;
  }

  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  geometry.setAttribute("position", positionAttribute);
  const material = new THREE.PointsMaterial({
    color: "#5faeff",
    size: 0.045,
    transparent: true,
    opacity: 0.33,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dust = new THREE.Points(geometry, material);

  return {
    object: dust,
    update: (elapsed) => {
      for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        const angle = phases[index]! + elapsed * (0.035 + (index % 7) * 0.002);
        const radius = radii[index]!;
        positions[offset] = Math.cos(angle) * radius;
        positions[offset + 2] = Math.sin(angle) * radius * 0.38;
      }
      positionAttribute.needsUpdate = true;
    },
  };
}

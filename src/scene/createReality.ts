import * as THREE from "three";
import type { McuReality } from "../data/realities";
import type { RealityVisual } from "./sceneTypes";

interface MaterialRecord {
  readonly material: THREE.Material;
  readonly opacity: number;
}

function markHitTargets(group: THREE.Group, realityId: string): THREE.Object3D[] {
  const targets: THREE.Object3D[] = [];
  group.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
      child.userData["realityId"] = realityId;
      targets.push(child);
    }
  });
  return targets;
}

function collectMaterials(group: THREE.Group): MaterialRecord[] {
  const records: MaterialRecord[] = [];
  const seen = new Set<THREE.Material>();
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Points)) return;
    const childMaterial = child.material as THREE.Material | THREE.Material[];
    const materials = Array.isArray(childMaterial) ? childMaterial : [childMaterial];
    materials.forEach((material) => {
      if (seen.has(material)) return;
      seen.add(material);
      material.transparent = true;
      records.push({ material, opacity: material.opacity });
    });
  });
  return records;
}

function createSacredTimeline(data: McuReality): {
  readonly group: THREE.Group;
  readonly animate: (elapsed: number, delta: number) => void;
} {
  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1, 4);
  const position = geometry.getAttribute("position");
  const colours = new Float32Array(position.count * 3);
  const ocean = new THREE.Color("#18598a");
  const land = new THREE.Color("#599b79");
  const ice = new THREE.Color("#b8d8dc");

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const continentalNoise =
      Math.sin(x * 8 + z * 3.2) + Math.cos(z * 9 - y * 4.1) + Math.sin(y * 12);
    const colour = Math.abs(y) > 0.83 ? ice : continentalNoise > 0.7 ? land : ocean;
    const offset = index * 3;
    colours[offset] = colour.r;
    colours[offset + 1] = colour.g;
    colours[offset + 2] = colour.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));

  const world = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.78,
      metalness: 0.04,
      emissive: "#092c4d",
      emissiveIntensity: 0.48,
    }),
  );
  world.rotation.z = -0.2;
  group.add(world);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.09, 36, 24),
    new THREE.MeshBasicMaterial({
      color: data.accentColor,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(atmosphere);

  const temporalShell = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.025, 6, 96),
    new THREE.MeshBasicMaterial({
      color: data.secondaryColor,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  temporalShell.rotation.x = Math.PI / 2.25;
  group.add(temporalShell);

  const moon = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.11, 1),
    new THREE.MeshBasicMaterial({ color: "#aec3cd" }),
  );
  group.add(moon);

  return {
    group,
    animate: (elapsed, delta) => {
      world.rotation.y += delta * 0.07;
      temporalShell.rotation.z -= delta * 0.075;
      const moonAngle = elapsed * 0.22;
      moon.position.set(Math.cos(moonAngle) * 1.48, Math.sin(moonAngle * 0.8) * 0.32, Math.sin(moonAngle) * 1.1);
    },
  };
}

function createVoid(data: McuReality): {
  readonly group: THREE.Group;
  readonly animate: (elapsed: number, delta: number) => void;
} {
  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(0.86, 2);
  const position = geometry.getAttribute("position");
  const vector = new THREE.Vector3();
  for (let index = 0; index < position.count; index += 1) {
    vector.fromBufferAttribute(position, index);
    const deform = 0.78 + Math.sin(index * 8.17) * 0.12 + Math.cos(index * 2.9) * 0.08;
    vector.multiplyScalar(deform);
    position.setXYZ(index, vector.x, vector.y * 0.72, vector.z);
  }
  geometry.computeVertexNormals();

  const wasteland = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: "#17221d",
      emissive: "#183927",
      emissiveIntensity: 0.55,
      roughness: 0.95,
      metalness: 0.12,
      flatShading: true,
    }),
  );
  group.add(wasteland);

  const haze = new THREE.Mesh(
    new THREE.SphereGeometry(1.07, 24, 16),
    new THREE.MeshBasicMaterial({
      color: data.accentColor,
      transparent: true,
      opacity: 0.09,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  haze.scale.y = 0.72;
  group.add(haze);

  const debrisGeometry = new THREE.TetrahedronGeometry(0.12, 0);
  const debrisMaterial = new THREE.MeshStandardMaterial({
    color: "#526258",
    emissive: "#263b2d",
    emissiveIntensity: 0.4,
    roughness: 0.88,
  });
  const debris = new THREE.InstancedMesh(debrisGeometry, debrisMaterial, 24);
  const dummy = new THREE.Object3D();
  for (let index = 0; index < 24; index += 1) {
    const angle = index * 2.399;
    const radius = 1.05 + (index % 6) * 0.12;
    dummy.position.set(
      Math.cos(angle) * radius,
      ((index % 5) - 2) * 0.13,
      Math.sin(angle) * radius * 0.68,
    );
    const size = 0.5 + (index % 4) * 0.18;
    dummy.scale.setScalar(size);
    dummy.rotation.set(angle, angle * 0.7, angle * 0.3);
    dummy.updateMatrix();
    debris.setMatrixAt(index, dummy.matrix);
  }
  group.add(debris);

  const brokenOrbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.24, 0.018, 4, 42, Math.PI * 1.54),
    new THREE.MeshBasicMaterial({
      color: "#8aae85",
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    }),
  );
  brokenOrbit.rotation.x = Math.PI / 2.7;
  group.add(brokenOrbit);

  return {
    group,
    animate: (elapsed, delta) => {
      wasteland.rotation.y -= delta * 0.027;
      debris.rotation.y += delta * 0.052;
      debris.rotation.z = Math.sin(elapsed * 0.16) * 0.08;
      haze.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.025);
    },
  };
}

function createQuantumRealm(data: McuReality): {
  readonly group: THREE.Group;
  readonly animate: (elapsed: number, delta: number) => void;
} {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.48, 2),
    new THREE.MeshStandardMaterial({
      color: "#4e174f",
      emissive: "#a53fb4",
      emissiveIntensity: 1.1,
      roughness: 0.45,
      metalness: 0.25,
      flatShading: true,
    }),
  );
  group.add(core);

  const shells = [
    { radius: 0.76, colour: data.secondaryColor, opacity: 0.12 },
    { radius: 1.02, colour: data.accentColor, opacity: 0.075 },
  ].map(({ radius, colour, opacity }) => {
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius, 2),
      new THREE.MeshBasicMaterial({
        color: colour,
        transparent: true,
        opacity,
        wireframe: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    group.add(shell);
    return shell;
  });

  const strand = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.67, 0.025, 96, 6, 2, 5),
    new THREE.MeshBasicMaterial({
      color: data.accentColor,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(strand);

  const count = 46;
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const angle = index * 2.18;
    const radius = 0.35 + (index % 9) * 0.09;
    const offset = index * 3;
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = Math.sin(angle * 1.7) * radius;
    positions[offset + 2] = Math.sin(angle) * radius;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: "#c9fcff",
      size: 0.055,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(particles);

  return {
    group,
    animate: (elapsed, delta) => {
      core.rotation.y += delta * 0.13;
      shells[0]!.rotation.y -= delta * 0.1;
      shells[0]!.rotation.x += delta * 0.035;
      shells[1]!.rotation.y += delta * 0.055;
      shells[1]!.rotation.z -= delta * 0.08;
      strand.rotation.x = elapsed * 0.08;
      strand.rotation.y -= delta * 0.09;
      particles.rotation.y += delta * 0.17;
    },
  };
}

export function createRealityVisual(data: McuReality): RealityVisual {
  const result =
    data.visualStyle === "sacred-timeline"
      ? createSacredTimeline(data)
      : data.visualStyle === "void"
        ? createVoid(data)
        : createQuantumRealm(data);

  const anchor = new THREE.Group();
  anchor.name = data.name;
  anchor.position.set(...data.position);
  anchor.scale.setScalar(data.scale);
  anchor.add(result.group);

  const hitTargets = markHitTargets(result.group, data.id);
  const materials = collectMaterials(result.group);
  let targetScale = 1;
  let currentScale = 1;
  let targetOpacity = 1;
  let currentOpacity = 1;

  return {
    object: anchor,
    data,
    hitTargets,
    focusPoint: new THREE.Vector3(...data.position),
    setInteractionState: (hovered, selected, dimmed) => {
      targetScale = selected ? 1.08 : hovered ? 1.055 : 1;
      targetOpacity = dimmed ? 0.2 : 1;
    },
    update: (elapsed, delta) => {
      result.animate(elapsed, delta);
      currentScale += (targetScale - currentScale) * Math.min(1, delta * 6);
      currentOpacity += (targetOpacity - currentOpacity) * Math.min(1, delta * 5);
      anchor.scale.setScalar(data.scale * currentScale);
      materials.forEach(({ material, opacity }) => {
        material.opacity = opacity * currentOpacity;
      });
    },
  };
}

import * as THREE from "three";
import type { McuReality } from "../data/realities";
import type { TimelineVisual } from "./sceneTypes";

export function createTimelinePath(reality: McuReality): TimelineVisual {
  const end = new THREE.Vector3(...reality.position);
  const midpoint = end.clone().multiplyScalar(0.52);
  midpoint.y += reality.position[1] > 0 ? -0.55 : 0.85;
  midpoint.z += 1.4;
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    midpoint,
    end,
  );

  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: reality.accentColor,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.022, 5, false), material);
  group.add(tube);

  const echoMaterial = new THREE.MeshBasicMaterial({
    color: reality.secondaryColor,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const echoCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.2, -0.05, -0.1),
    midpoint.clone().add(new THREE.Vector3(0.2, 0.24, -0.15)),
    end.clone().add(new THREE.Vector3(0.12, 0.08, 0)),
  );
  const echo = new THREE.Mesh(
    new THREE.TubeGeometry(echoCurve, 48, 0.012, 4, false),
    echoMaterial,
  );
  group.add(echo);

  const pulseCount = 4;
  const pulseGeometry = new THREE.SphereGeometry(0.036, 8, 6);
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: "#dffaff",
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8,
  });
  const pulses = Array.from({ length: pulseCount }, () => {
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    group.add(pulse);
    return pulse;
  });

  let targetIntensity = 1;
  let intensity = 1;

  return {
    object: group,
    realityId: reality.id,
    setInteractionState: (highlighted, dimmed) => {
      targetIntensity = highlighted ? 2.15 : dimmed ? 0.2 : 1;
    },
    update: (elapsed, delta) => {
      intensity += (targetIntensity - intensity) * Math.min(1, delta * 6);
      material.opacity = 0.34 * intensity;
      echoMaterial.opacity = 0.1 * intensity;
      pulseMaterial.opacity = Math.min(1, 0.72 * intensity);

      pulses.forEach((pulse, index) => {
        const base = (elapsed * 0.105 + index / pulseCount) % 1;
        pulse.position.copy(curve.getPoint(base));
        pulse.scale.setScalar(
          (0.75 + Math.sin(base * Math.PI) * 0.65) * Math.min(intensity, 1.35),
        );
      });
    },
  };
}

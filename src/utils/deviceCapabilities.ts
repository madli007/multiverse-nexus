export interface DeviceCapabilities {
  readonly isMobile: boolean;
  readonly reducedMotion: boolean;
  readonly pixelRatio: number;
  readonly particleMultiplier: number;
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  const isMobile = window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.35 : 1.75);

  return {
    isMobile,
    reducedMotion,
    pixelRatio,
    particleMultiplier: isMobile ? 0.55 : 1,
  };
}

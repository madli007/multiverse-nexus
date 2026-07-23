export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function easeInOutCubic(value: number): number {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export function damp(
  current: number,
  target: number,
  smoothing: number,
  delta: number,
): number {
  return current + (target - current) * (1 - Math.exp(-smoothing * delta));
}

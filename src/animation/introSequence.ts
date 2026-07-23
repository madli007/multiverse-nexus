import { clamp } from "../utils/math";

export interface IntroSequence {
  readonly update: (elapsed: number) => number;
  readonly skip: () => void;
  readonly isComplete: () => boolean;
}

export function createIntroSequence(
  reducedMotion: boolean,
  onProgress: (progress: number) => void,
): IntroSequence {
  const duration = 6.4;
  let skipped = reducedMotion;
  let complete = reducedMotion;

  if (reducedMotion) onProgress(1);

  return {
    update: (elapsed) => {
      const progress = skipped ? 1 : clamp(elapsed / duration, 0, 1);
      complete = progress >= 1;
      onProgress(progress);
      return progress;
    },
    skip: () => {
      skipped = true;
      complete = true;
      onProgress(1);
    },
    isComplete: () => complete,
  };
}

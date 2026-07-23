import type { McuReality } from "../data/realities";

export type NexusMode = "idle" | "focused";

export interface NexusSnapshot {
  readonly mode: NexusMode;
  readonly hoveredRealityId: string | null;
  readonly selectedRealityId: string | null;
}

export type NexusListener = (snapshot: NexusSnapshot) => void;

export interface NexusStore {
  readonly getSnapshot: () => NexusSnapshot;
  readonly subscribe: (listener: NexusListener) => () => void;
  readonly hover: (reality: McuReality | null) => void;
  readonly select: (reality: McuReality) => void;
  readonly reset: () => void;
}

export function createNexusStore(): NexusStore {
  let snapshot: NexusSnapshot = {
    mode: "idle",
    hoveredRealityId: null,
    selectedRealityId: null,
  };
  const listeners = new Set<NexusListener>();

  const publish = (next: NexusSnapshot): void => {
    snapshot = next;
    listeners.forEach((listener) => listener(snapshot));
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      listener(snapshot);
      return () => listeners.delete(listener);
    },
    hover: (reality) => {
      if (snapshot.hoveredRealityId === (reality?.id ?? null)) return;
      publish({ ...snapshot, hoveredRealityId: reality?.id ?? null });
    },
    select: (reality) => {
      publish({
        mode: "focused",
        hoveredRealityId: reality.id,
        selectedRealityId: reality.id,
      });
    },
    reset: () => {
      publish({
        mode: "idle",
        hoveredRealityId: null,
        selectedRealityId: null,
      });
    },
  };
}

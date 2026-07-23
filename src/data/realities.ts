export type RealityState =
  | "stable"
  | "branching"
  | "unstable"
  | "incursion"
  | "isolated"
  | "collapsed";

export type RealityType =
  | "universe"
  | "timeline"
  | "realm"
  | "dimension"
  | "temporal-location";

export type RealityVisualStyle =
  | "sacred-timeline"
  | "alternate-earth"
  | "tva"
  | "void"
  | "quantum"
  | "dark-dimension"
  | "animated-branch"
  | "incursion";

export interface McuReality {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly type: RealityType;
  readonly shortDescription: string;
  readonly state: RealityState;
  readonly stability: number;
  readonly relatedProjects: readonly string[];
  readonly notableCharacters: readonly string[];
  readonly notableEvents: readonly string[];
  readonly visualStyle: RealityVisualStyle;
  readonly accentColor: string;
  readonly secondaryColor: string;
  readonly position: readonly [number, number, number];
  readonly scale: number;
  readonly canonConfidence: "confirmed" | "partially-confirmed" | "interpretive";
}

export const realities: readonly McuReality[] = [
  {
    id: "sacred-timeline",
    name: "Sacred Timeline / Earth-616",
    shortName: "Earth-616",
    type: "timeline",
    shortDescription:
      "A protected reality carried on a calm temporal current. Its connection to the Nexus remains clear and resilient.",
    state: "stable",
    stability: 96,
    relatedProjects: ["Loki", "Avengers: Endgame"],
    notableCharacters: ["Loki", "Doctor Strange"],
    notableEvents: ["Temporal stabilization"],
    visualStyle: "sacred-timeline",
    accentColor: "#75d8ff",
    secondaryColor: "#e8b85a",
    position: [-6.6, 2.35, -1.4],
    scale: 1.38,
    canonConfidence: "interpretive",
  },
  {
    id: "void",
    name: "The Void",
    shortName: "The Void",
    type: "temporal-location",
    shortDescription:
      "A wasteland at the end of time where pruned matter gathers. Fragments drift beneath a fading temporal haze.",
    state: "unstable",
    stability: 38,
    relatedProjects: ["Loki", "Deadpool & Wolverine"],
    notableCharacters: ["Alioth", "Loki variants"],
    notableEvents: ["Pruned timelines"],
    visualStyle: "void",
    accentColor: "#8ed6a0",
    secondaryColor: "#a8b58b",
    position: [6.4, 2.15, -2.6],
    scale: 1.3,
    canonConfidence: "confirmed",
  },
  {
    id: "quantum-realm",
    name: "Quantum Realm",
    shortName: "Quantum Realm",
    type: "realm",
    shortDescription:
      "A subatomic dimension of nested scale and living energy. Its current folds inward as quickly as it expands.",
    state: "branching",
    stability: 71,
    relatedProjects: ["Ant-Man and the Wasp: Quantumania"],
    notableCharacters: ["Janet van Dyne", "Scott Lang"],
    notableEvents: ["Quantum traversal"],
    visualStyle: "quantum",
    accentColor: "#d184ff",
    secondaryColor: "#58e3e8",
    position: [4.8, -3.35, -0.7],
    scale: 1.18,
    canonConfidence: "confirmed",
  },
];

export function getReality(id: string): McuReality | undefined {
  return realities.find((reality) => reality.id === id);
}

import type { Point } from "./graphics/types.ts";

export type ValveKind = "intake" | "exhaust";

export interface ValveLayout {
  readonly seat: Point;
  readonly axis: Point;
  readonly peak: number;
}

export const layout = {
  crankCenter: [360, 710] as Point,
  crankRadius: 70,
  rodLength: 258,
  crownOffset: 34,
  boreLeft: 276,
  boreRight: 444,
  roof: [[276, 312], [330, 281], [344, 276], [376, 276], [390, 281], [444, 312]] as Point[],
};

export const valves: Record<ValveKind, ValveLayout> = {
  intake: { seat: [303, 296], axis: [0.5, Math.sqrt(3) / 2], peak: 0.125 },
  exhaust: { seat: [417, 296], axis: [-0.5, Math.sqrt(3) / 2], peak: 0.875 },
};
